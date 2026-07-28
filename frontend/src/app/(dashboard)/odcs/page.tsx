'use client';

import React, { useState } from 'react';
import { useOdcs, useCreateOdc, useUpdateOdc, useDeleteOdc } from '@/hooks/use-odcs';
import { Search, Plus, MapPin, Edit, Trash2, X, Check, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function OdcListPage() {
  const { data: odcs, isLoading, error } = useOdcs();
  const createOdc = useCreateOdc();
  const updateOdc = useUpdateOdc();
  const deleteOdc = useDeleteOdc();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [ponPortId, setPonPortId] = useState(''); // Typically this would be a select dropdown from PONs

  const filteredOdcs = odcs?.filter((odc) =>
    odc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    odc.asset_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (odc?: any) => {
    if (odc) {
      setEditingId(odc.id);
      setAssetCode(odc.asset_code);
      setName(odc.name);
      setPonPortId(odc.pon_port_id);
    } else {
      setEditingId(null);
      setAssetCode('');
      setName('');
      setPonPortId('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      asset_code: assetCode,
      name,
      pon_port_id: ponPortId,
    };

    if (editingId) {
      updateOdc.mutate({ id: editingId, data: payload }, {
        onSuccess: () => handleCloseModal()
      });
    } else {
      createOdc.mutate(payload, {
        onSuccess: () => handleCloseModal()
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ODC?')) {
      deleteOdc.mutate(id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Optical Distribution Cabinets (ODC)</h1>
          <p className="text-muted-foreground mt-2">Manage secondary network distribution points</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add ODC</span>
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ODCs by name or code..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">ODC Code</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Uplink (PON)</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                    Loading ODCs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-destructive">
                    Failed to load ODC data.
                  </td>
                </tr>
              ) : filteredOdcs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <MapPin className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p>No ODCs found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOdcs?.map((odc) => (
                  <tr key={odc.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{odc.asset_code}</td>
                    <td className="px-6 py-4 font-medium">{odc.name}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {odc.pon_port?.olt?.asset_code ? (
                        <div className="flex items-center gap-1">
                          {odc.pon_port.olt.asset_code} <ArrowRight className="w-3 h-3" /> Port {odc.pon_port_id.substring(0, 4)}...
                        </div>
                      ) : (
                        odc.pon_port_id.substring(0, 8) + '...'
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(odc.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(odc)}
                          className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(odc.id)}
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

      {/* Modal for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit ODC' : 'Add New ODC'}</h2>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ODC Code</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. ODC-JKT-01"
                  value={assetCode}
                  onChange={e => setAssetCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. North Region Cabinet"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PON Port ID (UUID)</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                  placeholder="Enter PON Port UUID..."
                  value={ponPortId}
                  onChange={e => setPonPortId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Note: In a full deployment, this would be a searchable dropdown pulling from /pons.
                </p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createOdc.isPending || updateOdc.isPending}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Create ODC'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
