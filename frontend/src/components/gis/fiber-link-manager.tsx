'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Cable, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const CABLE_COLORS = [
  { value: 'blue', label: 'Biru', hex: '#2196F3' },
  { value: 'orange', label: 'Jingga', hex: '#FF9800' },
  { value: 'green', label: 'Hijau', hex: '#4CAF50' },
  { value: 'brown', label: 'Coklat', hex: '#795548' },
  { value: 'slate', label: 'Abu-abu', hex: '#78909C' },
  { value: 'white', label: 'Putih', hex: '#FAFAFA' },
  { value: 'red', label: 'Merah', hex: '#F44336' },
  { value: 'black', label: 'Hitam', hex: '#212121' },
  { value: 'yellow', label: 'Kuning', hex: '#FFEB3B' },
  { value: 'violet', label: 'Ungu', hex: '#9C27B0' },
];

interface OdpItem {
  id: string;
  name: string;
  asset_code: string;
  free_ports: number;
}

interface LinkItem {
  id: string;
  from_odp_id: string;
  to_odp_id: string;
  from_port: number;
  to_port: number;
  cable_color: string;
  cable_core: number;
  from_name: string;
  to_name: string;
}

export function FiberLinkManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: odpList } = useQuery<OdpItem[]>({
    queryKey: ['gis-odps-list'],
    queryFn: () => api.get('/gis/odps').then(r => r.data),
    enabled: open,
  });

  const { data: links } = useQuery<LinkItem[]>({
    queryKey: ['fiber-links'],
    queryFn: () => api.get('/fiber-links').then(r => r.data),
    enabled: open,
  });

  const createLink = useMutation({
    mutationFn: (d: any) => api.post('/fiber-links', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiber-links'] });
      queryClient.invalidateQueries({ queryKey: ['gis-odps-list'] });
    },
  });

  const deleteLink = useMutation({
    mutationFn: (id: string) => api.delete(`/fiber-links/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fiber-links'] }),
  });

  const [fromOdp, setFromOdp] = useState('');
  const [toOdp, setToOdp] = useState('');
  const [fromPort, setFromPort] = useState('1');
  const [toPort, setToPort] = useState('1');
  const [cableColor, setCableColor] = useState('blue');
  const [cableCore, setCableCore] = useState('');

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 text-sm text-left">
      <Cable className="w-4 h-4 text-primary" /> Fiber Link Manager
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold flex items-center gap-2"><Cable className="w-5 h-5 text-primary" /> Fiber Link Manager</h2>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>

        {/* ADD LINK FORM */}
        <form onSubmit={e => {
          e.preventDefault();
          createLink.mutate({
            from_odp_id: fromOdp, to_odp_id: toOdp,
            from_port: parseInt(fromPort), to_port: parseInt(toPort),
            cable_color: cableColor, cable_core: cableCore ? parseInt(cableCore) : null,
          });
          setFromOdp(''); setToOdp(''); setFromPort('1'); setToPort('1');
        }} className="p-5 border-b border-border space-y-3">
          <h3 className="text-sm font-semibold">Tambah Koneksi Fiber</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1">Dari ODP</label>
              <select value={fromOdp} onChange={e => setFromOdp(e.target.value)} required
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md">
                <option value="">-- Pilih ODP --</option>
                {(odpList || []).map(o => <option key={o.id} value={o.id}>{o.name} ({o.asset_code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Ke ODP</label>
              <select value={toOdp} onChange={e => setToOdp(e.target.value)} required
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md">
                <option value="">-- Pilih ODP --</option>
                {(odpList || []).filter(o => o.id !== fromOdp).map(o => <option key={o.id} value={o.id}>{o.name} ({o.asset_code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Port From</label>
              <input value={fromPort} onChange={e => setFromPort(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md" />
            </div>
            <div>
              <label className="block text-xs mb-1">Port To</label>
              <input value={toPort} onChange={e => setToPort(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md" />
            </div>
            <div>
              <label className="block text-xs mb-1">Core Ke-</label>
              <input value={cableCore} onChange={e => setCableCore(e.target.value)}
                placeholder="cth: 2" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md" />
            </div>
            <div>
              <label className="block text-xs mb-1">Warna Kabel</label>
              <div className="flex gap-1 flex-wrap">
                {CABLE_COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setCableColor(c.value)}
                    className={`w-6 h-6 rounded-full border-2 ${cableColor === c.value ? 'border-primary scale-125' : 'border-transparent'}`}
                    style={{ backgroundColor: c.hex }} title={c.label} />
                ))}
              </div>
            </div>
          </div>
          <button type="submit" disabled={createLink.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Tambah Link
          </button>
        </form>

        {/* LINKS LIST */}
        <div className="p-5 space-y-2">
          <h3 className="text-sm font-semibold">Koneksi Aktif ({(links || []).length})</h3>
          {(links || []).length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada koneksi fiber</p>
          )}
          {(links || []).map(link => (
            <div key={link.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: CABLE_COLORS.find(c => c.value === link.cable_color)?.hex || '#6366f1' }} />
                  {link.from_name} → {link.to_name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Port: {link.from_port} → {link.to_port} {link.cable_core && `| Core: ${link.cable_core}`}
                </div>
              </div>
              <button onClick={() => deleteLink.mutate(link.id)}
                className="p-1.5 hover:bg-red-500/10 rounded-md text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
