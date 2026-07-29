'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Ruler, Crosshair, Cable, Network, Home, Box, Search, Satellite, Moon } from 'lucide-react';
import { useGisSync } from '@/hooks/use-gis-sync';
import { ContextMenu } from '@/components/gis/context-menu';
import { QuickSearch } from '@/components/gis/quick-search';
import { CreateDialog } from '@/components/gis/create-dialog';
import { CreateCableDialog } from '@/components/gis/create-cable-dialog';
import { SplitterDialog } from '@/components/gis/splitter-dialog';
import { ConnectCustomerDialog } from '@/components/gis/connect-customer-dialog';
import { FiberTracePanel } from '@/components/gis/fiber-trace';
import { buildTopologyIndex, getDownstreamCables, TopologyIndex } from '@/lib/topology';
import * as turf from '@turf/turf';
import api from '@/lib/api';

// Fix default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const JAKARTA: [number, number] = [-6.1751, 106.8272]; // Leaflet: [lat, lng]

const TILE_LAYERS = {
  osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '&copy; OSM' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Esri' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: 'CartoDB' },
};

const ASSET_COLORS: Record<string, string> = {
  OLT: '#f97316', ODC: '#eab308', ODP: '#22c55e', Pole: '#a855f7',
  Closure: '#06b6d4', Splitter: '#ec4899', Cable: '#6366f1',
};

// ---- Inner map components (need useMap / useMapEvents) ----

function MapEvents({ onMapClick, onMapRightClick, onMapMouseMove }: {
  onMapClick: (e: L.LeafletMouseEvent) => void;
  onMapRightClick: (e: L.LeafletMouseEvent) => void;
  onMapMouseMove: (e: L.LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: onMapClick,
    contextmenu: onMapRightClick,
    mousemove: onMapMouseMove,
  });
  return null;
}

function MapController({ flyTo }: { flyTo: { center: [number, number]; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo(flyTo.center, flyTo.zoom, { duration: 1.5 });
    }
  }, [flyTo, map]);
  return null;
}

function TileController({ tileStyle }: { tileStyle: string }) {
  return (
    <TileLayer
      key={tileStyle}
      url={TILE_LAYERS[tileStyle as keyof typeof TILE_LAYERS]?.url || TILE_LAYERS.osm.url}
      attribution={TILE_LAYERS[tileStyle as keyof typeof TILE_LAYERS]?.attr || TILE_LAYERS.osm.attr}
    />
  );
}

// ---- Asset marker style ----

function assetPointToLayer(feature: any, latlng: L.LatLng) {
  const type = feature.properties?.asset_type || 'Other';
  const color = ASSET_COLORS[type] || '#11b4da';
  return L.circleMarker(latlng, {
    radius: 8,
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.85,
  });
}

function customerPointToLayer(feature: any, latlng: L.LatLng) {
  return L.circleMarker(latlng, {
    radius: 6,
    fillColor: '#ef4444',
    color: '#fff',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.85,
  });
}

// ---- Main Page ----

export default function GisPage() {
  const { assets, customers, isLoading, startDrag, endDrag, startEdit, endEdit, refetch } = useGisSync();

  const [tileStyle, setTileStyle] = useState<'osm' | 'satellite' | 'dark'>('osm');
  const [cursorCoords, setCursorCoords] = useState<{lng: number; lat: number} | null>(null);
  const [contextMenu, setContextMenu] = useState<{x: number; y: number; lng: number; lat: number} | null>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [flyTo, setFlyTo] = useState<{center: [number, number]; zoom: number} | null>(null);

  // Dialogs
  const [createType, setCreateType] = useState<string | null>(null);
  const [createCoords, setCreateCoords] = useState<{lng: number; lat: number}>({ lng: 106.8272, lat: -6.1751 });
  const [showCableDialog, setShowCableDialog] = useState(false);
  const [showSplitterDialog, setShowSplitterDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showTrace, setShowTrace] = useState<{id: string; type: 'odp' | 'customer'; name: string} | null>(null);

  // Layers
  const [showAssets, setShowAssets] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);
  const [showCables, setShowCables] = useState(true);

  // Measurement
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<number[][]>([]);
  const [traceGeoJSON, setTraceGeoJSON] = useState<any>(null);

  // Topology
  const topologyIndex = useMemo<TopologyIndex | null>(() => {
    const assetList = assets?.features?.map((f: any) => ({
      id: f.properties?.id || f.properties?.asset_code,
      name: f.properties?.name || f.properties?.asset_code,
      type: f.properties?.asset_type || f.properties?.type,
      coordinates: f.geometry?.coordinates as [number, number],
      parent: f.properties?.parent,
      ...f.properties,
    })) || [];
    const customerList = customers?.features?.map((f: any) => ({
      id: f.properties?.id,
      name: f.properties?.name,
      type: 'Customer',
      coordinates: f.geometry?.coordinates as [number, number],
      parent: f.properties?.parent || f.properties?.odp_id,
      ...f.properties,
    })) || [];
    return buildTopologyIndex(assetList, customerList);
  }, [assets, customers]);

  // Cable GeoJSON from topology
  const cableGeoJSON = useMemo(() => {
    if (!topologyIndex || !showCables) return null;
    const allPaths: number[][][] = [];
    Object.keys(topologyIndex.nodeMap).forEach((key) => {
      allPaths.push(...getDownstreamCables(topologyIndex, key));
    });
    if (allPaths.length === 0) return null;
    return {
      type: 'FeatureCollection' as const,
      features: allPaths.map((coords) => ({
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: coords },
        properties: {},
      })),
    };
  }, [topologyIndex, showCables]);

  // Quick search
  const handleSearchSelect = useCallback((item: { lng: number; lat: number; id: string }) => {
    setFlyTo({ center: [item.lat, item.lng], zoom: 18 });
    setPopupInfo(item);
  }, []);

  // Context menu
  const handleContextAction = useCallback((action: string, coords: {lng: number; lat: number}) => {
    startEdit();
    switch (action) {
      case 'add-odp': setCreateType('odp'); setCreateCoords(coords); break;
      case 'add-pole': setCreateType('pole'); setCreateCoords(coords); break;
      case 'add-closure': setCreateType('closure'); setCreateCoords(coords); break;
      case 'add-homepass': setCreateType('homepass'); setCreateCoords(coords); break;
      case 'measure': setIsMeasuring(true); break;
      case 'copy-coords': navigator.clipboard.writeText(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`); break;
    }
    setContextMenu(null);
  }, [startEdit]);

  const handleCreateClose = useCallback(() => {
    setCreateType(null);
    endEdit();
    refetch();
  }, [endEdit, refetch]);

  // Map event handlers
  const onMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (isMeasuring) {
      setMeasurePoints(prev => [...prev, [e.latlng.lng, e.latlng.lat]]);
    }
    setContextMenu(null);
  }, [isMeasuring]);

  const onMapRightClick = useCallback((e: L.LeafletMouseEvent) => {
    const container = e.originalEvent.target as HTMLElement;
    const mapEl = container?.closest('.leaflet-container');
    if (mapEl) {
      const rect = mapEl.getBoundingClientRect();
      setContextMenu({
        x: e.originalEvent.clientX - rect.left,
        y: e.originalEvent.clientY - rect.top,
        lng: e.latlng.lng,
        lat: e.latlng.lat,
      });
    }
    setPopupInfo(null);
  }, []);

  const onMapMouseMove = useCallback((e: L.LeafletMouseEvent) => {
    setCursorCoords({ lng: e.latlng.lng, lat: e.latlng.lat });
  }, []);

  // GeoJSON event handlers
  const onEachAsset = useCallback((feature: any, layer: L.Layer) => {
    const props = feature.properties;
    layer.on('click', () => {
      setPopupInfo({ ...props, lng: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1] });
    });
  }, []);

  const onEachCustomer = useCallback((feature: any, layer: L.Layer) => {
    const props = feature.properties;
    layer.on('click', () => {
      setPopupInfo({ ...props, type: 'Customer', lng: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1] });
    });
  }, []);

  const measureGeoJSON = useMemo(() => {
    if (measurePoints.length < 2) return null;
    return turf.lineString(measurePoints);
  }, [measurePoints]);

  const totalDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    return turf.length(turf.lineString(measurePoints), { units: 'meters' });
  }, [measurePoints]);

  // Cable style
  const cableStyle = useCallback(() => ({
    color: '#6366f1', weight: 2, opacity: 0.6, dashArray: '4 2',
  }), []);

  // Measure style
  const measureStyle = useCallback(() => ({
    color: '#f97316', weight: 4, dashArray: '2 2',
  }), []);

  // Trace style
  const traceStyle = useCallback(() => ({
    color: '#f97316', weight: 6, opacity: 0.8,
  }), []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') { setIsMeasuring(prev => !prev); setMeasurePoints([]); }
      if (e.key === 'Escape') { setPopupInfo(null); setContextMenu(null); setShowTrace(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-card border-r border-border flex flex-col z-10 shadow-lg shrink-0">
        {/* Tile Switcher */}
        <div className="px-4 pt-3 pb-2 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Map Style</h3>
          <div className="flex gap-1">
            {([
              { key: 'osm' as const, icon: MapPin, label: 'Street' },
              { key: 'satellite' as const, icon: Satellite, label: 'Sat' },
              { key: 'dark' as const, icon: Moon, label: 'Dark' },
            ]).map(t => (
              <button key={t.key} onClick={() => setTileStyle(t.key)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${tileStyle === t.key ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50'}`}>
                <t.icon className="w-3 h-3" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Search */}
        <div className="p-3 border-b border-border">
          <QuickSearch onSelect={handleSearchSelect} />
        </div>

        {/* Layers */}
        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Layers</h3>
          {[
            { key: 'showAssets', label: 'Network Assets', icon: Network, color: '#22c55e', state: showAssets, set: setShowAssets },
            { key: 'showCustomers', label: 'Customers', icon: Home, color: '#ef4444', state: showCustomers, set: setShowCustomers },
            { key: 'showCables', label: 'Fiber Cables', icon: Cable, color: '#6366f1', state: showCables, set: setShowCables },
          ].map(layer => (
            <label key={layer.key} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm">
              <input type="checkbox" checked={layer.state} onChange={e => layer.set(e.target.checked)} className="rounded" />
              <span style={{ color: layer.color }}><layer.icon className="w-4 h-4" /></span>
              <span>{layer.label}</span>
            </label>
          ))}

          {/* Quick Actions */}
          <div className="pt-4 mt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Quick Actions</h3>
            <div className="space-y-1">
              <button onClick={() => { startEdit(); setShowCableDialog(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 text-sm text-left">
                <Cable className="w-4 h-4 text-primary" /> Create Fiber Cable
              </button>
              <button onClick={() => { startEdit(); setShowSplitterDialog(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 text-sm text-left">
                <Layers className="w-4 h-4 text-primary" /> Add Splitter
              </button>
              <button onClick={() => { startEdit(); setShowConnectDialog(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 text-sm text-left">
                <Home className="w-4 h-4 text-primary" /> Connect Customer
              </button>
            </div>
          </div>

          {/* Measurement */}
          <div className="pt-4 mt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1">
              <Ruler className="w-3 h-3" /> Measure
            </h3>
            <button onClick={() => { setIsMeasuring(!isMeasuring); setMeasurePoints([]); }}
              className={`w-full px-3 py-2 rounded-md text-sm text-left ${isMeasuring ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50'}`}>
              {isMeasuring ? 'Measuring... (Esc to stop)' : 'Start Measuring (M)'}
            </button>
            {isMeasuring && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                Points: {measurePoints.length} | {totalDistance.toFixed(1)}m
                <button onClick={() => setMeasurePoints([])} className="block text-primary mt-1 hover:underline">Clear</button>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="pt-4 mt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Legend</h3>
            <div className="space-y-1.5">
              {Object.entries(ASSET_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>{type}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                <span>Customer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1 relative" onContextMenu={e => e.preventDefault()}>
        <MapContainer
          center={JAKARTA}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={true}
        >
          <TileController tileStyle={tileStyle} />
          <MapController flyTo={flyTo} />
          <MapEvents onMapClick={onMapClick} onMapRightClick={onMapRightClick} onMapMouseMove={onMapMouseMove} />

          {/* Assets */}
          {showAssets && assets && (
            <GeoJSON key="assets" data={assets} pointToLayer={assetPointToLayer} onEachFeature={onEachAsset} />
          )}

          {/* Customers */}
          {showCustomers && customers && (
            <GeoJSON key="customers" data={customers} pointToLayer={customerPointToLayer} onEachFeature={onEachCustomer} />
          )}

          {/* Cables */}
          {cableGeoJSON && (
            <GeoJSON key="cables" data={cableGeoJSON} style={cableStyle} />
          )}

          {/* Measurement */}
          {isMeasuring && measureGeoJSON && (
            <GeoJSON key="measure" data={measureGeoJSON} style={measureStyle} />
          )}

          {/* Trace */}
          {traceGeoJSON && (
            <GeoJSON key="trace" data={traceGeoJSON} style={traceStyle} />
          )}

          {/* Popup - render outside GeoJSON via Marker */}
          {popupInfo && (
            <Popup
              position={[popupInfo.lat || popupInfo.latitude, popupInfo.lng || popupInfo.longitude]}
              eventHandlers={{ remove: () => setPopupInfo(null) }}
            >
              <div className="p-1 min-w-[180px]">
                <h4 className="font-semibold text-sm">{popupInfo.name || popupInfo.id}</h4>
                <p className="text-xs text-muted-foreground">{popupInfo.type || popupInfo.asset_type}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setShowTrace({ id: popupInfo.id, type: (popupInfo.type || '').toLowerCase()?.includes('customer') ? 'customer' : 'odp', name: popupInfo.name })}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20">Trace</button>
                  <button onClick={() => setContextMenu({ x: popupInfo.lng, y: popupInfo.lat, lng: popupInfo.lng || popupInfo.longitude, lat: popupInfo.lat || popupInfo.latitude })}
                    className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/50">Actions</button>
                </div>
              </div>
            </Popup>
          )}
        </MapContainer>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x} y={contextMenu.y} lng={contextMenu.lng} lat={contextMenu.lat}
            onClose={() => setContextMenu(null)}
            onAction={handleContextAction}
          />
        )}

        {/* Coords */}
        <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur border border-border rounded-lg text-xs font-mono">
            <Crosshair className="w-3 h-3 text-muted-foreground" />
            {cursorCoords ? `${cursorCoords.lat.toFixed(5)}, ${cursorCoords.lng.toFixed(5)}` : 'Hover map for coords'}
          </div>
        </div>

        {/* Trace Panel */}
        {showTrace && (
          <FiberTracePanel
            assetId={showTrace.id} assetType={showTrace.type} assetName={showTrace.name}
            onClose={() => setShowTrace(null)}
            onHighlight={(geojson) => setTraceGeoJSON(geojson)}
            onClearHighlight={() => setTraceGeoJSON(null)}
          />
        )}
      </div>

      {/* DIALOGS */}
      <CreateDialog open={!!createType} type={createType as any} coordinates={createCoords}
        onClose={handleCreateClose} onCreated={handleCreateClose} />
      <CreateCableDialog open={showCableDialog} onClose={() => { setShowCableDialog(false); endEdit(); }} />
      <SplitterDialog open={showSplitterDialog} onClose={() => { setShowSplitterDialog(false); endEdit(); }} />
      <ConnectCustomerDialog open={showConnectDialog} onClose={() => { setShowConnectDialog(false); endEdit(); }} />
    </div>
  );
}
