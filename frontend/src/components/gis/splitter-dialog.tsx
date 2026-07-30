'use client';

import { useState } from 'react';
import { X, Loader2, GitBranch } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function SplitterDialog({ open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [odpId, setOdpId] = useState('');
  const [name, setName] = useState('');
  const [ratioIn, setRatioIn] = useState(1);
  const [ratioOut, setRatioOut] = useState(8);

  const { data: odps } = useQuery({
    queryKey: ['odps-list-splitter'],
    queryFn: () => api.get('/odps').then(r => r.data),
    enabled: open,
  });

  const createSplitter = useMutation({
    mutationFn: (data: any) => api.post('/splitters', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gis-assets'] });
      onCreated?.();
      onClose();
      setName(''); setOdpId('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSplitter.mutate({
      name: name || `Splitter ${ratioIn}:${ratioOut}`,
      splitter_code: `SPL-${Date.now().toString(36).toUpperCase()}`,
      ratio_in: ratioIn,
      ratio_out: ratioOut,
      odp_id: odpId,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2"><GitBranch className="w-5 h-5 text-primary" /> Add Splitter</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target ODP</label>
            <select required value={odpId} onChange={e => setOdpId(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md">
              <option value="">Select ODP...</option>
              {odps?.map((o: any) => <option key={o.id} value={o.id}>{o.name || o.odp_code}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Splitter Name</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Splitter 1:8 A" className="w-full px-3 py-2 bg-background border border-border rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ratio In</label>
              <select value={ratioIn} onChange={e => setRatioIn(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md">
                <option value={1}>1</option><option value={2}>2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ratio Out</label>
              <select value={ratioOut} onChange={e => setRatioOut(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md">
                <option value={4}>4</option><option value={8}>8</option><option value={16}>16</option><option value={32}>32</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted/50">Cancel</button>
            <button type="submit" disabled={createSplitter.isPending || !odpId}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {createSplitter.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Add Splitter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
