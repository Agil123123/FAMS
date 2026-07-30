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

// ---- Asset SVG Icons ----

const ASSET_ICONS: Record<string, string> = {
  // Distribution box — square with ports
  odp: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="38" viewBox="0 0 32 38">
    <rect x="2" y="14" width="28" height="22" rx="3" fill="#22c55e" stroke="#fff" stroke-width="2"/>
    <rect x="8" y="17" width="6" height="4" rx="1" fill="#fff" opacity="0.9"/>
    <rect x="18" y="17" width="6" height="4" rx="1" fill="#fff" opacity="0.9"/>
    <rect x="8" y="24" width="6" height="4" rx="1" fill="#fff" opacity="0.9"/>
    <rect x="18" y="24" width="6" height="4" rx="1" fill="#fff" opacity="0.9"/>
    <circle cx="16" cy="8" r="5" fill="#22c55e" stroke="#fff" stroke-width="2"/>
    <line x1="16" y1="13" x2="16" y2="14" stroke="#fff" stroke-width="2"/>
  </svg>`,
  // Tower pole
  pole: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 28 42">
    <line x1="14" y1="10" x2="14" y2="40" stroke="#a855f7" stroke-width="4"/>
    <line x1="4" y1="14" x2="24" y2="14" stroke="#a855f7" stroke-width="3"/>
    <line x1="6" y1="20" x2="22" y2="20" stroke="#a855f7" stroke-width="3"/>
    <line x1="8" y1="26" x2="20" y2="26" stroke="#a855f7" stroke-width="3"/>
    <circle cx="14" cy="10" r="4" fill="#a855f7" stroke="#fff" stroke-width="2"/>
    <circle cx="14" cy="40" r="3" fill="#fff" stroke="#a855f7" stroke-width="2"/>
  </svg>`,
  // Fiber closure — junction box
  closure: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
    <rect x="4" y="6" width="26" height="22" rx="6" fill="#06b6d4" stroke="#fff" stroke-width="2"/>
    <line x1="10" y1="12" x2="24" y2="12" stroke="#fff" stroke-width="2" opacity="0.9"/>
    <line x1="10" y1="17" x2="24" y2="17" stroke="#fff" stroke-width="2" opacity="0.9"/>
    <line x1="10" y1="22" x2="24" y2="22" stroke="#fff" stroke-width="2" opacity="0.9"/>
    <path d="M4 14 L1 12 L1 16Z" fill="#06b6d4" stroke="#fff" stroke-width="1"/>
    <path d="M4 20 L1 18 L1 22Z" fill="#06b6d4" stroke="#fff" stroke-width="1"/>
    <path d="M30 14 L33 12 L33 16Z" fill="#06b6d4" stroke="#fff" stroke-width="1"/>
    <path d="M30 20 L33 18 L33 22Z" fill="#06b6d4" stroke="#fff" stroke-width="1"/>
  </svg>`,
  // House
  homepass: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="36" viewBox="0 0 32 36">
    <path d="M2 16 L16 2 L30 16" fill="none" stroke="#f97316" stroke-width="3"/>
    <path d="M6 14 L6 34 L26 34 L26 14" fill="#f97316" stroke="#fff" stroke-width="2"/>
    <rect x="12" y="24" width="8" height="10" rx="1" fill="#fff" opacity="0.8"/>
    <circle cx="18" cy="29" r="1.5" fill="#f97316"/>
  </svg>`,
  // Customer — user pin
  customer: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <circle cx="12" cy="9" r="7" fill="#ef4444" stroke="#fff" stroke-width="2"/>
    <path d="M1 34 C1 24 23 24 23 34" fill="#ef4444" stroke="#fff" stroke-width="2"/>
    <circle cx="12" cy="7" r="2" fill="#fff" opacity="0.6"/>
  </svg>`,
};

function makeIcon(type: string): L.DivIcon {
  const svg = ASSET_ICONS[type] || ASSET_ICONS['odp'];
  return L.divIcon({
    html: svg,
    className: '', // no default leaflet styles
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });
}

// Pre-built icons
const ICON_ODP = makeIcon('odp');
const ICON_POLE = makeIcon('pole');
const ICON_CLOSURE = makeIcon('closure');
const ICON_HOMEPASS = makeIcon('homepass');
const ICON_CUSTOMER = makeIcon('customer');

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

const ICON_MAP: Record<string, L.DivIcon> = {
  odp: ICON_ODP,
  pole: ICON_POLE,
  closure: ICON_CLOSURE,
  homepass: ICON_HOMEPASS,
};

function assetPointToLayer(feature: any, latlng: L.LatLng) {
  const type = (feature.properties?.type || feature.properties?.asset_type || 'odp').toLowerCase();
  return L.marker(latlng, { icon: ICON_MAP[type] || ICON_ODP });
}

function customerPointToLayer(feature: any, latlng: L.LatLng) {
  return L.marker(latlng, { icon: ICON_CUSTOMER });
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
