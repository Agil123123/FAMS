'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Map, Source, Layer, NavigationControl, ScaleControl, Marker, Popup, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, MapPin, Ruler, Crosshair, Cable, Network, Home, Box, Search, X } from 'lucide-react';
import { useGisAssets, useGisCustomers } from '@/hooks/use-gis';
import { ContextMenu } from '@/components/gis/context-menu';
import { QuickSearch } from '@/components/gis/quick-search';
import { CreateDialog } from '@/components/gis/create-dialog';
import { CreateCableDialog } from '@/components/gis/create-cable-dialog';
import { SplitterDialog } from '@/components/gis/splitter-dialog';
import { ConnectCustomerDialog } from '@/components/gis/connect-customer-dialog';
import { FiberTracePanel } from '@/components/gis/fiber-trace';
import * as turf from '@turf/turf';
import api from '@/lib/api';

const JAKARTA: [number, number] = [106.8272, -6.1751];

const mapStyle = {
  version: 8,
  sources: { osm: { type: 'raster' as const, tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '&copy; OSM', maxzoom: 19 } },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }]
};

const ASSET_COLORS: Record<string, string> = {
  OLT: '#f97316', ODC: '#eab308', ODP: '#22c55e', Pole: '#a855f7',
  Closure: '#06b6d4', Splitter: '#ec4899', Cable: '#6366f1',
};

export default function GisPage() {
  const mapRef = useRef<MapRef>(null);
  const { data: assets } = useGisAssets();
  const { data: customers } = useGisCustomers();

  // Map state
  const [cursorCoords, setCursorCoords] = useState<{lng: number; lat: number} | null>(null);
  const [contextMenu, setContextMenu] = useState<{x: number; y: number; lng: number; lat: number} | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);

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
  const [showPoles, setShowPoles] = useState(true);
  const [showClosures, setShowClosures] = useState(true);
  const [showSplitters, setShowSplitters] = useState(true);
  const [showCables, setShowCables] = useState(true);

  // Measurement
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<number[][]>([]);
  const [traceGeoJSON, setTraceGeoJSON] = useState<any>(null);

  // Quick search handler
  const handleSearchSelect = useCallback((item: { lng: number; lat: number; id: string }) => {
    mapRef.current?.flyTo({ center: [item.lng, item.lat], zoom: 18, duration: 1500 });
    setPopupInfo(item);
  }, []);

  // Context menu actions
  const handleContextAction = useCallback((action: string, coords: {lng: number; lat: number}) => {
    switch (action) {
      case 'add-odp': setCreateType('odp'); setCreateCoords(coords); break;
      case 'add-pole': setCreateType('pole'); setCreateCoords(coords); break;
      case 'add-closure': setCreateType('closure'); setCreateCoords(coords); break;
      case 'add-homepass': setCreateType('homepass'); setCreateCoords(coords); break;
      case 'measure': setIsMeasuring(true); break;
      case 'copy-coords': navigator.clipboard.writeText(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`); break;
    }
    setContextMenu(null);
  }, []);

  // Map click
  const onMapClick = useCallback((e: any) => {
    if (isMeasuring) {
      setMeasurePoints(prev => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
    }
    setContextMenu(null);
  }, [isMeasuring]);

  const onMapRightClick = useCallback((e: any) => {
    e.originalEvent.preventDefault();
    const rect = (e.target as HTMLElement)?.closest('.maplibregl-canvas-container')?.getBoundingClientRect();
    if (rect) {
      setContextMenu({ x: e.originalEvent.clientX - rect.left, y: e.originalEvent.clientY - rect.top, lng: e.lngLat.lng, lat: e.lngLat.lat });
    }
    setPopupInfo(null);
  }, []);

  const onMapMouseMove = useCallback((e: any) => {
    setCursorCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
  }, []);

  // Filter assets by type for layers
  const assetsByType = useMemo(() => {
    if (!assets) return {};
    const grouped: Record<string, any[]> = {};
    assets.features?.forEach((f: any) => {
      const type = f.properties?.asset_type || f.properties?.type || 'Other';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(f);
    });
    return grouped;
  }, [assets]);

  const measureGeoJSON = useMemo(() => {
    if (measurePoints.length < 2) return null;
    return turf.lineString(measurePoints);
  }, [measurePoints]);

  const totalDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    return turf.length(turf.lineString(measurePoints), { units: 'meters' });
  }, [measurePoints]);

  // Keyboard shortcuts
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
        {/* Quick Search */}
        <div className="p-3 border-b border-border">
          <QuickSearch onSelect={handleSearchSelect} />
        </div>

        {/* Layer Toggles */}
        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Layers</h3>
          {[
            { key: 'showAssets', label: 'Network Assets', icon: Network, color: '#22c55e', state: showAssets, set: setShowAssets },
            { key: 'showCustomers', label: 'Customers', icon: Home, color: '#ef4444', state: showCustomers, set: setShowCustomers },
            { key: 'showCables', label: 'Fiber Cables', icon: Cable, color: '#6366f1', state: showCables, set: setShowCables },
            { key: 'showPoles', label: 'Poles', icon: MapPin, color: '#a855f7', state: showPoles, set: setShowPoles },
            { key: 'showClosures', label: 'Closures', icon: Box, color: '#06b6d4', state: showClosures, set: setShowClosures },
            { key: 'showSplitters', label: 'Splitters', icon: Layers, color: '#ec4899', state: showSplitters, set: setShowSplitters },
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
              <button onClick={() => setShowCableDialog(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 text-sm text-left">
                <Cable className="w-4 h-4 text-primary" /> Create Fiber Cable
              </button>
              <button onClick={() => setShowSplitterDialog(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 text-sm text-left">
                <Layers className="w-4 h-4 text-primary" /> Add Splitter
              </button>
              <button onClick={() => setShowConnectDialog(true)}
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

      {/* MAP CANVAS */}
      <div className="flex-1 relative" onContextMenu={e => e.preventDefault()}>
        <Map
          ref={mapRef}
          initialViewState={{ longitude: JAKARTA[0], latitude: JAKARTA[1], zoom: 13 }}
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
          onClick={onMapClick}
          onContextMenu={onMapRightClick as any}
          onMouseMove={onMapMouseMove}
        >
          <NavigationControl position="top-right" />
          <ScaleControl position="bottom-right" />

          {/* Assets Layer */}
          {showAssets && assets && (
            <Source id="assets-source" type="geojson" data={assets} cluster={true} clusterMaxZoom={14} clusterRadius={50}>
              <Layer id="clusters" type="circle" filter={['has', 'point_count']}
                paint={{ 'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 50, '#f28cb1'], 'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40] }} />
              <Layer id="cluster-count" type="symbol" filter={['has', 'point_count']}
                layout={{ 'text-field': '{point_count_abbreviated}', 'text-font': ['Open Sans Regular'], 'text-size': 12 }} />
              <Layer id="unclustered-assets" type="circle" filter={['!', ['has', 'point_count']]}
                paint={{ 'circle-color': '#11b4da', 'circle-radius': 8, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }} />
            </Source>
          )}

          {/* Customers Layer */}
          {showCustomers && customers && (
            <Source id="customers-source" type="geojson" data={customers}>
              <Layer id="customers-layer" type="circle"
                paint={{ 'circle-color': '#ef4444', 'circle-radius': 6, 'circle-stroke-width': 1, 'circle-stroke-color': '#fff' }} />
            </Source>
          )}

          {/* Measurement Layer */}
          {isMeasuring && measureGeoJSON && (
            <Source id="measure-source" type="geojson" data={measureGeoJSON}>
              <Layer id="measure-lines" type="line"
                paint={{ 'line-color': '#f97316', 'line-width': 4, 'line-dasharray': [2, 2] }} />
            </Source>
          )}

          {/* Trace highlight */}
          {traceGeoJSON && (
            <Source id="trace-source" type="geojson" data={traceGeoJSON}>
              <Layer id="trace-line" type="line"
                paint={{ 'line-color': '#f97316', 'line-width': 6, 'line-opacity': 0.8 }} />
            </Source>
          )}

          {/* Popup */}
          {popupInfo && (
            <Popup longitude={popupInfo.lng || popupInfo.longitude} latitude={popupInfo.lat || popupInfo.latitude}
              anchor="bottom" onClose={() => setPopupInfo(null)} closeButton={true} closeOnClick={false}>
              <div className="p-1 min-w-[180px]">
                <h4 className="font-semibold text-sm">{popupInfo.name || popupInfo.id}</h4>
                <p className="text-xs text-muted-foreground">{popupInfo.type || popupInfo.asset_type}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setShowTrace({ id: popupInfo.id, type: popupInfo.type?.toLowerCase()?.includes('customer') ? 'customer' : 'odp', name: popupInfo.name })}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20">Trace</button>
                  <button onClick={() => setContextMenu({ x: popupInfo.lng, y: popupInfo.lat, lng: popupInfo.lng || popupInfo.longitude, lat: popupInfo.lat || popupInfo.latitude })}
                    className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/50">Actions</button>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x} y={contextMenu.y} lng={contextMenu.lng} lat={contextMenu.lat}
            onClose={() => setContextMenu(null)}
            onAction={handleContextAction}
          />
        )}

        {/* Coordinate Display */}
        <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur border border-border rounded-lg text-xs font-mono">
            <Crosshair className="w-3 h-3 text-muted-foreground" />
            {cursorCoords ? `${cursorCoords.lat.toFixed(5)}, ${cursorCoords.lng.toFixed(5)}` : 'Hover map for coords'}
          </div>
        </div>

        {/* Fiber Trace Panel */}
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
      <CreateDialog
        open={!!createType}
        type={createType as any}
        coordinates={createCoords}
        onClose={() => setCreateType(null)}
        onCreated={() => setCreateType(null)}
      />
      <CreateCableDialog open={showCableDialog} onClose={() => setShowCableDialog(false)} />
      <SplitterDialog open={showSplitterDialog} onClose={() => setShowSplitterDialog(false)} />
      <ConnectCustomerDialog open={showConnectDialog} onClose={() => setShowConnectDialog(false)} />
    </div>
  );
}
