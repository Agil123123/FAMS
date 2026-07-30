'use client';
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Props { type: 'odp'|'pole'|'closure'|'homepass'; coordinates: {lng: number; lat: number}; open: boolean; onClose: () => void; onCreated?: () => void; }

export function CreateDialog({ type, coordinates, open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, any>>({});
  const create = useMutation({
    mutationFn: (data: any) => {
      return api.post('/gis/create', { type, name: data.name, longitude: coordinates.lng, latitude: coordinates.lat, ...data });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gis-assets'] }); queryClient.invalidateQueries({ queryKey: ['gis-customers'] }); onCreated?.(); onClose(); },
    onError: (err: any) => {
      console.error('[CreateDialog] Failed:', err?.response?.data || err?.message || err);
      alert('Failed to create: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));
    },
  });

  if (!open) return null;

  const titles: Record<string, string> = { odp: 'Add ODP', pole: 'Add Pole', closure: 'Add Closure', homepass: 'Add Homepass' };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">{titles[type]}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="p-6 space-y-4">
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </div>
          {type === 'odp' && (
            <>
              <div><label className="block text-sm font-medium mb-2">ODP Name</label>
                <input required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. ODP-001" className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-2">ODP Code</label>
                <input value={form.odp_code || ''} onChange={e => setForm({...form, odp_code: e.target.value})}
                  placeholder={`ODP-${Date.now().toString(36).toUpperCase().slice(-4)}`} className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-2">Capacity</label>
                <select value={form.capacity || 8} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md">
                  {[4,8,12,16,24,32,48].map(n => <option key={n} value={n}>{n} Ports</option>)}</select></div>
            </>
          )}
          {type === 'pole' && (
            <>
              <div><label className="block text-sm font-medium mb-2">Pole Name</label>
                <input required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Pole-A01" className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Height (m)</label>
                  <select value={form.height || 7} onChange={e => setForm({...form, height: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md">
                    {[5,6,7,8,9,10,12].map(n => <option key={n} value={n}>{n}m</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-2">Material</label>
                  <select value={form.material || 'Concrete'} onChange={e => setForm({...form, material: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md">
                    <option>Concrete</option><option>Steel</option><option>Wood</option></select></div>
              </div>
            </>
          )}
          {type === 'closure' && (
            <>
              <div><label className="block text-sm font-medium mb-2">Closure Name</label>
                <input required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Closure-A1" className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
            </>
          )}
          {type === 'homepass' && (
            <>
              <div><label className="block text-sm font-medium mb-2">Address</label>
                <input required value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="Street address" className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-2">House Number</label>
                <input value={form.house_number || ''} onChange={e => setForm({...form, house_number: e.target.value})}
                  placeholder="e.g. 42A" className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
            </>
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted/50">Cancel</button>
            <button type="submit" disabled={create.isPending} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
