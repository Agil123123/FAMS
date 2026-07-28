'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useGisAssets, useGisCustomers } from '@/hooks/use-gis';
import { Map, Source, Layer, NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Crosshair, MapPin, Ruler } from 'lucide-react';
import * as turf from '@turf/turf';

// Stub map style for offline/sandbox mode if needed
const mapStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
} as any;

export default function GisDashboardPage() {
  const { data: assets } = useGisAssets();
  const { data: customers } = useGisCustomers();

  const [showAssets, setShowAssets] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);
  
  // Measurement tool state
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<number[][]>([]);
  const [cursorCoords, setCursorCoords] = useState<{lng: number, lat: number} | null>(null);

  const onMapClick = useCallback((event: any) => {
    if (isMeasuring) {
      setMeasurePoints(prev => [...prev, [event.lngLat.lng, event.lngLat.lat]]);
    }
  }, [isMeasuring]);

  const onMouseMove = useCallback((event: any) => {
    setCursorCoords({ lng: event.lngLat.lng, lat: event.lngLat.lat });
  }, []);

  const measureGeoJSON = useMemo(() => {
    if (measurePoints.length < 2) return null;
    return turf.lineString(measurePoints);
  }, [measurePoints]);

  const totalDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    return turf.length(turf.lineString(measurePoints), { units: 'meters' });
  }, [measurePoints]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Sidebar / Controls */}
      <div className="w-80 bg-background border-r p-4 flex flex-col space-y-6 z-10 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GIS Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Network Topology Mapping</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center">
            <Layers className="w-4 h-4 mr-2" /> Map Layers
          </h3>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <input type="checkbox" checked={showAssets} onChange={e => setShowAssets(e.target.checked)} />
              <span>Network Assets (OLT, ODC, ODP)</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input type="checkbox" checked={showCustomers} onChange={e => setShowCustomers(e.target.checked)} />
              <span>Customer Terminals</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center">
            <Ruler className="w-4 h-4 mr-2" /> Measurement Tool
          </h3>
          <Button 
            variant={isMeasuring ? "default" : "outline"} 
            className="w-full"
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              if (isMeasuring) setMeasurePoints([]);
            }}
          >
            {isMeasuring ? 'Stop Measuring' : 'Start Measuring'}
          </Button>
          {isMeasuring && (
            <div className="text-sm border p-3 rounded-md bg-muted/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points:</span>
                <span className="font-medium">{measurePoints.length}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-medium">{totalDistance.toFixed(2)} m</span>
              </div>
              {measurePoints.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setMeasurePoints([])}>
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative">
        <Map
          initialViewState={{ longitude: 106.8272, latitude: -6.1751, zoom: 12 }}
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
          onClick={onMapClick}
          onMouseMove={onMouseMove}
          interactiveLayerIds={showAssets ? ['unclustered-assets'] : []}
        >
          <NavigationControl position="top-right" />
          <ScaleControl position="bottom-right" />

          {/* Network Assets Layer with Clustering */}
          {showAssets && assets && (
            <Source
              id="assets-source"
              type="geojson"
              data={assets}
              cluster={true}
              clusterMaxZoom={14}
              clusterRadius={50}
            >
              <Layer
                id="clusters"
                type="circle"
                filter={['has', 'point_count']}
                paint={{
                  'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 50, '#f28cb1'],
                  'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40]
                }}
              />
              <Layer
                id="cluster-count"
                type="symbol"
                filter={['has', 'point_count']}
                layout={{
                  'text-field': '{point_count_abbreviated}',
                  'text-font': ['Open Sans Regular'],
                  'text-size': 12
                }}
              />
              <Layer
                id="unclustered-assets"
                type="circle"
                filter={['!', ['has', 'point_count']]}
                paint={{
                  'circle-color': '#11b4da',
                  'circle-radius': 8,
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#fff'
                }}
              />
            </Source>
          )}

          {/* Customers Layer */}
          {showCustomers && customers && (
            <Source id="customers-source" type="geojson" data={customers}>
              <Layer
                id="unclustered-customers"
                type="circle"
                paint={{
                  'circle-color': '#ef4444',
                  'circle-radius': 6,
                  'circle-stroke-width': 1,
                  'circle-stroke-color': '#fff'
                }}
              />
            </Source>
          )}

          {/* Measurement Layer */}
          {isMeasuring && measureGeoJSON && (
            <Source id="measure-source" type="geojson" data={measureGeoJSON}>
              <Layer
                id="measure-lines"
                type="line"
                paint={{
                  'line-color': '#f97316',
                  'line-width': 4,
                  'line-dasharray': [2, 2]
                }}
              />
            </Source>
          )}
        </Map>

        {/* Live Coordinate Overlay */}
        <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
          <Card className="p-2 px-3 flex items-center space-x-2 text-xs font-mono bg-background/90 backdrop-blur">
            <Crosshair className="w-3 h-3 text-muted-foreground" />
            <span>
              {cursorCoords 
                ? `${cursorCoords.lat.toFixed(5)}, ${cursorCoords.lng.toFixed(5)}` 
                : 'Hover over map to read coordinates'}
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}
