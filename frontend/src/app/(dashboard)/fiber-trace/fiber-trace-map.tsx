'use client';

import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FiberTraceMapProps {
  geojsonFeatures: GeoJSON.FeatureCollection;
  initialCenter: [number, number];
}

export default function FiberTraceMap({ geojsonFeatures, initialCenter }: FiberTraceMapProps) {
  return (
    <MapContainer
      center={initialCenter}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap Contributors"
      />
      <GeoJSON
        data={geojsonFeatures}
        pointToLayer={(feature, latlng) =>
          L.circleMarker(latlng, {
            radius: 8,
            fillColor: '#3b82f6',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85,
          })
        }
      />
    </MapContainer>
  );
}
