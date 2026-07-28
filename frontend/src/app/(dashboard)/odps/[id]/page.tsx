'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useOdp, 
  useOdpCapacity,
  useOdpPorts,
  useOdpCustomers
} from '@/hooks/use-odps';
import { ArrowLeft, Edit, MapPin, Share2, Activity, Users, SplitSquareHorizontal, Image as ImageIcon, History } from 'lucide-react';
import { format } from 'date-fns';

export default function OdpDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: odp, isLoading: isOdpLoading } = useOdp(id);
  const { data: capacity } = useOdpCapacity(id);
  const { data: ports } = useOdpPorts(id);
  const { data: customers } = useOdpCustomers(id);

  const [activeTab, setActiveTab] = useState<'overview' | 'ports' | 'customers'>('overview');

  if (isOdpLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Loading ODP details...</div>
      </div>
    );
  }

  if (!odp) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        ODP not found.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/odps')}
            className="p-2 hover:bg-muted rounded-full transition-colors border border-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{odp.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 font-mono text-sm">
              <Share2 className="w-4 h-4" /> {odp.asset_code}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Map View</span>
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <span>Edit ODP</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        {['overview', 'ports', 'customers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium transition-colors capitalize ${
              activeTab === tab 
                ? 'border-b-2 border-primary text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Left Content Area Based on Tab */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'overview' && (
            <>
              {/* Capacity Widget */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Capacity Overview
                </h3>
                {capacity ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Ports</p>
                      <p className="text-2xl font-bold">{capacity.total_ports}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Used Ports</p>
                      <p className="text-2xl font-bold text-primary">{capacity.used_ports}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Available Ports</p>
                      <p className="text-2xl font-bold text-green-500">{capacity.available_ports}</p>
                    </div>
                    <div className="col-span-3 mt-2">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            capacity.utilization_percentage > 90 ? 'bg-destructive' 
                            : capacity.utilization_percentage > 75 ? 'bg-yellow-500' 
                            : 'bg-green-500'
                          }`} 
                          style={{ width: `${Math.min(100, capacity.utilization_percentage)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground text-right mt-1">{capacity.utilization_percentage.toFixed(1)}% Utilized</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Calculating capacity...</p>
                )}
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" /> Network Topology
                </h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Uplink Closure Node</p>
                  <p className="font-medium text-foreground">{odp.closure?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{odp.closure?.asset_code}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ports' && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SplitSquareHorizontal className="w-5 h-5 text-primary" /> Splitter Ports
              </h3>
              {ports && ports.length > 0 ? (
                <div className="space-y-4">
                  {ports.map((p: any) => (
                    <div key={p.id} className="p-4 border border-border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{p.asset_code}</p>
                        <p className="text-xs text-muted-foreground">Type: {p.splitter_type?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No splitters configured for this ODP.</p>
              )}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Active Customers
              </h3>
              {customers && customers.length > 0 ? (
                <div className="space-y-3">
                  {customers.map((c: any) => (
                    <div key={c.id} className="p-3 bg-muted rounded-lg flex justify-between items-center cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => router.push(`/customers/${c.id}`)}>
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.customer_id || c.id.substring(0, 8)}</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No customers currently connected to this ODP.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sidebar (Photos, Docs, History) */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> Photos
            </h3>
            <div className="p-6 border border-dashed border-border rounded-md text-center text-muted-foreground">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No photos attached</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Recent History
            </h3>
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">No activity recorded</p>
          </div>
        </div>
      </div>
    </div>
  );
}
