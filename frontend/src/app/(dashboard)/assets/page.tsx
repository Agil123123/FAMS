'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssets } from '@/hooks/use-assets';
import { Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AssetListPage() {
  const router = useRouter();
  const { data: assets, isLoading, error } = useAssets();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = assets?.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-2">Manage all physical network components</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets by name or code..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-border rounded-md flex items-center gap-2 hover:bg-muted/50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Asset Code</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                    Loading assets...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                    Failed to load assets.
                  </td>
                </tr>
              ) : filteredAssets?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <Search className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p>No assets found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets?.map((asset) => (
                  <tr key={asset.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{asset.asset_code}</td>
                    <td className="px-6 py-4">{asset.name}</td>
                    <td className="px-6 py-4">
                      {asset.asset_type?.name || <span className="text-muted-foreground italic">Uncategorized</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        asset.status === 'ACTIVE' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(asset.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => router.push(`/assets/${asset.id}`)}
                          className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-destructive/10 rounded-md transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{filteredAssets?.length || 0}</span> assets
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-border rounded hover:bg-muted disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-muted disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
