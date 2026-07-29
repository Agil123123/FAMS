'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssets, useCreateAsset } from '@/hooks/use-assets';
import { Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';

interface AssetType {
  id: string;
  name: string;
}

export default function AssetListPage() {
  const router = useRouter();
  const { data: assets, isLoading, error } = useAssets();
  const createAsset = useCreateAsset();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [types, setTypes] = useState<AssetType[]>([]);
  const [form, setForm] = useState({
    asset_code: '',
    name: '',
    description: '',
    asset_type_id: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    api.get('/assets/types').then(({ data }) => setTypes(data));
  }, []);

  const filteredAssets = assets?.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAsset.mutateAsync(form);
    setShowModal(false);
    setForm({ asset_code: '', name: '', description: '', asset_type_id: '', status: 'ACTIVE' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-2">Manage all physical network components</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
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
                      <p className="text-lg font-medium mb-2">No assets found</p>
                      <p className="text-sm mb-4">
                        {searchTerm ? 'Try a different search term' : 'Get started by adding your first asset'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowModal(true)}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Add First Asset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets?.map((asset) => (
                  <tr key={asset.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-primary">{asset.asset_code}</td>
                    <td className="px-6 py-4 font-medium">{asset.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-muted px-2 py-1 rounded text-xs">
                        {asset.asset_type?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        asset.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(asset.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => router.push(`/assets/${asset.id}`)} className="p-2 hover:bg-muted rounded-md"><Eye className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-muted rounded-md"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-md"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold">Create Asset</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Asset Code</label>
                <input
                  required
                  value={form.asset_code}
                  onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                  placeholder="e.g. AST-1001"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Main Router X1"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Asset Type</label>
                <select
                  required
                  value={form.asset_type_id}
                  onChange={(e) => setForm({ ...form, asset_type_id: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select type...</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAsset.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {createAsset.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {createAsset.isPending ? 'Creating...' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
