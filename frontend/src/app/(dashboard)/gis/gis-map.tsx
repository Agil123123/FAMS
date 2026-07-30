'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const JAKARTA: [number, number] = [-6.1751, 106.8272];

const TILE_LAYERS = {
  osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '&copy; OSM' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Esri' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: 'CartoDB' },
};

const ASSET_COLORS: Record<string, string> = {
  OLT: '#f97316', ODC: '#eab308', ODP: '#22c55e', Pole: '#a855f7',
  Closure: '#06b6d4', Splitter: '#ec4899', Cable: '#6366f1',
};

// ---- Inner map components ----

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
  const type = feature.properties?.type || feature.properties?.asset_type || 'Other';
  const color = ASSET_COLORS[type] || '#11b4da';
  return L.circleMarker(latlng, {
    radius: 8, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.85,
  });
}

function customerPointToLayer(feature: any, latlng: L.LatLng) {
  return L.circleMarker(latlng, {
    radius: 6, fillColor: '#ef4444', color: '#fff', weight: 1, opacity: 1, fillOpacity: 0.85,
  });
}

// ---- GisMap Props ----

export interface GisMapProps {
  tileStyle: string;
  flyTo: { center: [number, number]; zoom: number } | null;
  popupInfo: any;
  onPopupClose: () => void;
  onTraceClick: (id: string, name: string) => void;
  onActionClick: (lng: number, lat: number) => void;
  showAssets: boolean;
  showCustomers: boolean;
  showCables: boolean;
  showFiberLinks: boolean;
  isMeasuring: boolean;
  assets: any;
  customers: any;
  cableGeoJSON: any;
  fiberLinkGeoJSON: any;
  measureGeoJSON: any;
  traceGeoJSON: any;
  onMapClick: (e: L.LeafletMouseEvent) => void;
  onMapRightClick: (e: L.LeafletMouseEvent) => void;
  onMapMouseMove: (e: L.LeafletMouseEvent) => void;
  onEachAsset: (feature: any, layer: L.Layer) => void;
  onEachCustomer: (feature: any, layer: L.Layer) => void;
  cableStyle: () => any;
  measureStyle: () => any;
  traceStyle: () => any;
}

// ---- Main GisMap ----

export default function GisMap(props: GisMapProps) {
  const {
    tileStyle, flyTo, popupInfo, onPopupClose, onTraceClick, onActionClick,
    showAssets, showCustomers, showCables, showFiberLinks, isMeasuring,
    assets, customers, cableGeoJSON, fiberLinkGeoJSON, measureGeoJSON, traceGeoJSON,
    onMapClick, onMapRightClick, onMapMouseMove,
    onEachAsset, onEachCustomer,
    cableStyle, measureStyle, traceStyle,
  } = props;

  return (
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

      {showAssets && assets && (
        <GeoJSON key={`assets-${assets?.features?.length || 0}`} data={assets} pointToLayer={assetPointToLayer} onEachFeature={onEachAsset} />
      )}
      {showCustomers && customers && (
        <GeoJSON key={`customers-${customers?.features?.length || 0}`} data={customers} pointToLayer={customerPointToLayer} onEachFeature={onEachCustomer} />
      )}
      {cableGeoJSON && (
        <GeoJSON key="cables" data={cableGeoJSON} style={cableStyle} />
      )}
      {showFiberLinks && fiberLinkGeoJSON?.features?.length > 0 && (
        <GeoJSON key={`fiberlinks-${fiberLinkGeoJSON.features.length}`} data={fiberLinkGeoJSON} style={() => ({ color: '#f59e0b', weight: 4, opacity: 0.8 })} />
      )}
      {isMeasuring && measureGeoJSON && (
        <GeoJSON key="measure" data={measureGeoJSON} style={measureStyle} />
      )}
      {traceGeoJSON && (
        <GeoJSON key="trace" data={traceGeoJSON} style={traceStyle} />
      )}

      {popupInfo && (
        <Popup
          position={[popupInfo.lat || popupInfo.latitude, popupInfo.lng || popupInfo.longitude]}
          eventHandlers={{ remove: () => onPopupClose() }}
        >
          <div className="p-1 min-w-[180px]">
            <h4 className="font-semibold text-sm">{popupInfo.name || popupInfo.id}</h4>
            <p className="text-xs text-muted-foreground">{popupInfo.type || popupInfo.asset_type}</p>
            <div className="flex gap-1 mt-2">
              <button onClick={() => onTraceClick(popupInfo.id, popupInfo.name)}
                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20">Trace</button>
              <button onClick={() => onActionClick(popupInfo.lng || popupInfo.longitude, popupInfo.lat || popupInfo.latitude)}
                className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/50">Actions</button>
            </div>
          </div>
        </Popup>
      )}
    </MapContainer>
  );
}
