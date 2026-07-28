'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useAsset, 
  useAssetPhotos, 
  useAssetDocuments, 
  useAssetHistory 
} from '@/hooks/use-assets';
import { ArrowLeft, Edit, MapPin, Box, Hash, Tag, Activity, Clock, Image as ImageIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: asset, isLoading } = useAsset(id);
  const { data: photos } = useAssetPhotos(id);
  const { data: documents } = useAssetDocuments(id);
  const { data: history } = useAssetHistory(id);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Loading asset details...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Asset not found.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/assets')}
            className="p-2 hover:bg-muted rounded-full transition-colors border border-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                asset.status === 'ACTIVE' 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                  : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
              }`}>
                {asset.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Hash className="w-4 h-4" /> {asset.asset_code}
            </p>
          </div>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Edit className="w-4 h-4" />
          <span>Edit Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-primary" /> General Information
            </h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Asset Type</p>
                <p className="font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {asset.asset_type?.name || 'Uncategorized'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vendor / Manufacturer</p>
                <p className="font-medium flex items-center gap-2">
                  <Box className="w-4 h-4 text-muted-foreground" />
                  {asset.vendor?.name || 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="font-medium text-foreground/90">{asset.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>

          {/* Location details mockup */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Location & Coordinates
            </h3>
            <div className="h-48 bg-muted/30 border border-border rounded-lg flex items-center justify-center text-muted-foreground">
              GIS Map Placeholder for {asset.asset_code}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar (Photos, Docs, History) */}
        <div className="space-y-6">
          
          {/* History */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Activity Log
            </h3>
            {history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="mt-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
                      <p className="text-xs text-muted-foreground/70 mt-1">{format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">No activity recorded</p>
            )}
          </div>

          {/* Photos */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> Photos
            </h3>
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {photos.map(p => (
                  <div key={p.id} className="aspect-square bg-muted rounded-md overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.photo_url} alt="Asset" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-border rounded-md text-center text-muted-foreground">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No photos attached</p>
                <button className="text-primary text-xs font-medium mt-2 hover:underline">Upload Photo</button>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Documents
            </h3>
            {documents && documents.length > 0 ? (
              <ul className="space-y-2">
                {documents.map(d => (
                  <li key={d.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm flex-1 truncate">{d.document_type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">No documents attached</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
