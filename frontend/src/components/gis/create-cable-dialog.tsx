'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Cable, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateCableDialog({ open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [startOdpId, setStartOdpId] = useState('');
  const [endOdpId, setEndOdpId] = useState('');
  const [name, setName] = useState('');
  const [coreCount, setCoreCount] = useState(24);
  const [length, setLength] = useState('');

  const { data: odps } = useQuery({
    queryKey: ['odps-list'],
    queryFn: () => api.get('/odps').then(r => r.data),
    enabled: open,
  });

  const startOdp = useMemo(() => odps?.find((o: any) => o.id === startOdpId), [odps, startOdpId]);
  const endOdp = useMemo(() => odps?.find((o: any) => o.id === endOdpId), [odps, endOdpId]);

  // Auto-calculate length from ODP coordinates
  useEffect(() => {
    if (startOdp?.latitude && startOdp?.longitude && endOdp?.latitude && endOdp?.longitude) {
      const R = 6371000;
      const dLat = (endOdp.latitude - startOdp.latitude) * Math.PI / 180;
      const dLon = (endOdp.longitude - startOdp.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(startOdp.latitude*Math.PI/180)*Math.cos(endOdp.latitude*Math.PI/180)*Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      setLength(Math.round(R * c).toString());
    }
  }, [startOdp, endOdp]);

  const createCable = useMutation({
    mutationFn: (data: any) => api.post('/fiber/cables', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gis-assets'] });
      onCreated?.();
      onClose();
      setName(''); setStartOdpId(''); setEndOdpId(''); setCoreCount(24); setLength('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCable.mutate({
      name: name || `Cable-${startOdp?.name || '?'}-${endOdp?.name || '?'}`,
      cable_code: `CBL-${Date.now().toString(36).toUpperCase()}`,
      core_count: coreCount,
      length_meters: parseInt(length) || 0,
      start_odp_id: startOdpId,
      end_odp_id: endOdpId,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2"><Cable className="w-5 h-5 text-primary" /> Create Fiber Cable</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Start ODP</label>
              <select required value={startOdpId} onChange={e => setStartOdpId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md">
                <option value="">Select...</option>
                {odps?.map((o: any) => <option key={o.id} value={o.id}>{o.name || o.odp_code}</option>)}
              </select>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground mb-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">End ODP</label>
              <select required value={endOdpId} onChange={e => setEndOdpId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md">
                <option value="">Select...</option>
                {odps?.map((o: any) => <option key={o.id} value={o.id}>{o.name || o.odp_code}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cable Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Auto-generated if empty" className="w-full px-3 py-2 bg-background border border-border rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Core Count</label>
              <select value={coreCount} onChange={e => setCoreCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md">
                <option value={4}>4 Core</option><option value={8}>8 Core</option>
                <option value={12}>12 Core</option><option value={24}>24 Core</option>
                <option value={48}>48 Core</option><option value={96}>96 Core</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Length (meters)</label>
              <input type="number" value={length} onChange={e => setLength(e.target.value)}
                placeholder="Auto-calculated" className="w-full px-3 py-2 bg-background border border-border rounded-md" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted/50">Cancel</button>
            <button type="submit" disabled={createCable.isPending || !startOdpId || !endOdpId}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {createCable.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Cable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
