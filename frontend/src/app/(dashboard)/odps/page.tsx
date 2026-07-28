'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOdps, useDeleteOdp } from '@/hooks/use-odps';
import { Search, Filter, Share2, Eye, Edit, Trash2, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function OdpListPage() {
  const router = useRouter();
  const { data: odps, isLoading, error } = useOdps();
  const deleteOdp = useDeleteOdp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredOdps = odps?.filter((odp) =>
    odp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    odp.asset_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ODP?')) {
      deleteOdp.mutate(id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Optical Distribution Points (ODP)</h1>
          <p className="text-muted-foreground mt-2">Manage edge nodes and customer distribution terminals</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ODPs by name or code..."
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
                <th className="px-6 py-4 font-medium">ODP Code</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Uplink (Closure)</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                    Loading ODPs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-destructive">
                    Failed to load ODP data.
                  </td>
                </tr>
              ) : filteredOdps?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <Share2 className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p>No ODPs found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOdps?.map((odp) => (
                  <tr key={odp.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{odp.asset_code}</td>
                    <td className="px-6 py-4 font-medium">{odp.name}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {odp.closure?.asset_code || odp.closure_id.substring(0, 8) + '...'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(odp.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => router.push(`/odps/${odp.id}`)}
                          className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(odp.id)}
                          className="p-2 hover:bg-destructive/10 rounded-md transition-colors text-muted-foreground hover:text-destructive"
                        >
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
      </div>
    </div>
  );
}
