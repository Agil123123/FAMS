'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { Layers, MapPin, Ruler, Crosshair, Network, Home, Search, Satellite, Moon } from 'lucide-react';
import { useGisSync } from '@/hooks/use-gis-sync';
import { ContextMenu } from '@/components/gis/context-menu';
import { QuickSearch } from '@/components/gis/quick-search';
import { CreateDialog } from '@/components/gis/create-dialog';
import * as turf from '@turf/turf';

const GisMap = dynamic(() => import('./gis-map'), { ssr: false });

export default function GisPage() {
  const { assets, customers, isLoading, startEdit, endEdit, refetch } = useGisSync();

  const [tileStyle, setTileStyle] = useState<'osm' | 'satellite' | 'dark'>('osm');
  const [cursorCoords, setCursorCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lng: number; lat: number } | null>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [flyTo, setFlyTo] = useState<{ center: [number, number]; zoom: number } | null>(null);

  const [createType, setCreateType] = useState<string | null>(null);
  const [createCoords, setCreateCoords] = useState<{ lng: number; lat: number }>({ lng: 106.8272, lat: -6.1751 });

  const [showAssets, setShowAssets] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);

  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<number[][]>([]);

  const handleSearchSelect = useCallback((item: { lng: number; lat: number; id: string }) => {
    setFlyTo({ center: [item.lat, item.lng], zoom: 18 });
    setPopupInfo(item);
  }, []);

  const handleContextAction = useCallback((action: string, coords: { lng: number; lat: number }) => {
    startEdit();
    switch (action) {
      case 'add-odp': setCreateType('odp'); setCreateCoords(coords); break;
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

  const onEachAsset = useCallback((feature: any, layer: L.Layer) => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    layer.bindPopup(`
      <div style="min-width:180px;font-family:sans-serif">
        <strong>${props.name || props.asset_code}</strong><br/>
        <span style="color:#888;font-size:11px">${props.type || 'ODP'}</span><br/>
        <span style="color:#888;font-size:11px">${props.asset_code || ''}</span>
        ${props.address ? `<br/><span style="color:#888;font-size:11px">${props.address}</span>` : ''}
      </div>
    `);
    layer.on('click', () => {
      setPopupInfo({ ...props, lng: coords[0], lat: coords[1] });
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

  // Keyboard
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') { setIsMeasuring(prev => !prev); setMeasurePoints([]); }
      if (e.key === 'Escape') { setPopupInfo(null); setContextMenu(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-card border-r border-border flex flex-col z-10 shadow-lg shrink-0">
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

        <div className="p-3 border-b border-border">
          <QuickSearch onSelect={handleSearchSelect} />
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Layers</h3>
          {[
            { key: 'showAssets', label: 'Network Assets', icon: Network, color: '#22c55e', state: showAssets, set: setShowAssets },
            { key: 'showCustomers', label: 'Customers', icon: Home, color: '#ef4444', state: showCustomers, set: setShowCustomers },
          ].map(layer => (
            <label key={layer.key} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm">
              <input type="checkbox" checked={layer.state} onChange={e => layer.set(e.target.checked)} className="rounded" />
              <span style={{ color: layer.color }}><layer.icon className="w-4 h-4" /></span>
              <span>{layer.label}</span>
            </label>
          ))}

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

          <div className="pt-4 mt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Legend</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                <span>ODP</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
                <span>Homepass</span>
              </div>
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
        <GisMap
          tileStyle={tileStyle}
          flyTo={flyTo}
          popupInfo={popupInfo}
          onPopupClose={() => setPopupInfo(null)}
          onActionClick={(lng, lat) => setContextMenu({ x: lng, y: lat, lng, lat })}
          showAssets={showAssets}
          showCustomers={showCustomers}
          isMeasuring={isMeasuring}
          assets={assets}
          customers={customers}
          measureGeoJSON={measureGeoJSON}
          onMapClick={onMapClick}
          onMapRightClick={onMapRightClick}
          onMapMouseMove={onMapMouseMove}
          onEachAsset={onEachAsset}
          onEachCustomer={onEachCustomer}
        />

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x} y={contextMenu.y} lng={contextMenu.lng} lat={contextMenu.lat}
            onClose={() => setContextMenu(null)}
            onAction={handleContextAction}
          />
        )}

        <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur border border-border rounded-lg text-xs font-mono">
            <Crosshair className="w-3 h-3 text-muted-foreground" />
            {cursorCoords ? `${cursorCoords.lat.toFixed(5)}, ${cursorCoords.lng.toFixed(5)}` : 'Hover map for coords'}
          </div>
        </div>
      </div>

      <CreateDialog open={!!createType} type={createType as any} coordinates={createCoords}
        onClose={handleCreateClose} onCreated={handleCreateClose} />
    </div>
  );
}
