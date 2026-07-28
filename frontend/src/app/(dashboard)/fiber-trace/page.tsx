'use client';

import React, { useState, useRef } from 'react';
import { useTraceFromCustomer } from '@/hooks/use-fiber-trace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Search, Loader2 } from 'lucide-react';

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

export default function FiberTracePage() {
  const [customerId, setCustomerId] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);

  const { data: traceData, isLoading, isError } = useTraceFromCustomer(activeQuery, {
    enabled: !!activeQuery
  });

  const handleSearch = () => {
    setActiveQuery(customerId);
  };

  const handleExportPdf = async () => {
    if (!mapRef.current) return;
    const canvas = await html2canvas(mapRef.current, { useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`fiber-trace-${activeQuery}.pdf`);
  };

  // Build GeoJSON features for the map
  const geojsonFeatures: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: traceData?.nodes
      .filter((n) => n.geometry)
      .map((node) => ({
        type: 'Feature',
        geometry: node.geometry,
        properties: {
          id: node.id,
          name: node.name,
          type: node.type
        }
      })) || []
  };

  return (
    <div className="flex flex-col h-screen space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fiber Trace Dashboard</h1>
          <p className="text-muted-foreground">Visualize physical signal routing across the network</p>
        </div>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Enter Customer UUID" 
            className="border p-2 rounded w-64"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={!customerId || isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Trace
          </Button>
          <Button variant="outline" onClick={handleExportPdf} disabled={!traceData}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4">
        <div className="col-span-1 space-y-4">
          <Card className="h-full overflow-y-auto">
            <CardHeader>
              <CardTitle>Topology Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {isError && <p className="text-red-500">Failed to fetch trace data.</p>}
              {!traceData && !isLoading && <p className="text-muted-foreground">Enter a valid ID to begin tracing.</p>}
              
              <ul className="space-y-4 relative">
                {traceData?.nodes.map((node, i) => (
                  <li key={node.id} className="relative pl-6">
                    {/* Visual connecting line */}
                    {i < traceData.nodes.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-blue-500/30" />
                    )}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                    <div>
                      <p className="text-sm font-semibold">{node.type}</p>
                      <p className="text-xs text-muted-foreground">{node.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-3 rounded-lg overflow-hidden border bg-muted relative" ref={mapRef}>
          {traceData ? (
            <Map
              initialViewState={{
                longitude: (geojsonFeatures.features[0]?.geometry as any)?.coordinates?.[0] || 0,
                latitude: (geojsonFeatures.features[0]?.geometry as any)?.coordinates?.[1] || 0,
                zoom: 14
              }}
              mapStyle={mapStyle}
              style={{ width: '100%', height: '100%' }}
            >
              <NavigationControl position="top-left" />
              <Source id="trace-source" type="geojson" data={geojsonFeatures}>
                <Layer
                  id="trace-points"
                  type="circle"
                  paint={{
                    'circle-radius': 8,
                    'circle-color': '#3b82f6',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                  }}
                />
              </Source>
            </Map>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Map Visualization Ready
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
