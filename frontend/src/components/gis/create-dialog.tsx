'use client';
import { useState, useEffect } from 'react';
import { X, Loader2, Wrench, Plug } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Props {
  type: 'odp'|'pole'|'closure'|'homepass';
  coordinates: {lng: number; lat: number};
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

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
  { value: 'pink', label: 'Pink', hex: '#E91E63' },
  { value: 'aqua', label: 'Aqua', hex: '#00BCD4' },
];

export function CreateDialog({ type, coordinates, open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'general' | 'connection'>('general');
  const [form, setForm] = useState<Record<string, any>>({});
  const [parentId, setParentId] = useState('');

  // Fetch ODPs for parent dropdown
  const { data: odpList } = useQuery({
    queryKey: ['gis-odps-list'],
    queryFn: () => api.get('/gis/odps').then(r => r.data),
    enabled: open,
  });

  // Fetch ports when parent selected
  const { data: parentPorts } = useQuery({
    queryKey: ['gis-odp-ports', parentId],
    queryFn: () => api.get(`/gis/odps/${parentId}/ports`).then(r => r.data),
    enabled: !!parentId,
  });

  const create = useMutation({
    mutationFn: (data: any) => {
      const payload = { type, name: data.name, longitude: coordinates.lng, latitude: coordinates.lat, ...data };
      if (parentId) payload.parent_id = parentId;
      return api.post('/gis/create', payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gis-assets'] }); queryClient.invalidateQueries({ queryKey: ['gis-customers'] }); queryClient.invalidateQueries({ queryKey: ['gis-odps-list'] }); onCreated?.(); onClose(); },
    onError: (err: any) => {
      console.error('[CreateDialog] Failed:', err?.response?.data || err?.message || err);
      alert('Gagal: ' + (err?.response?.data?.message || err?.message || 'Unknown'));
    },
  });

  if (!open) return null;

  const titles: Record<string, string> = { odp: 'Tambah ODP', pole: 'Tambah Tiang', closure: 'Tambah Closure', homepass: 'Tambah Homepass' };

  const selectedParent = parentId ? (odpList || []).find((o: any) => o.id === parentId) : null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold">{titles[type]}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-border">
          <button onClick={() => setTab('general')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'general' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground/70'}`}>
            <Wrench className="w-4 h-4" /> Umum
          </button>
          <button onClick={() => setTab('connection')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'connection' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground/70'}`}>
            <Plug className="w-4 h-4" /> Koneksi
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="p-6">
          {/* TAB GENERAL */}
          {tab === 'general' && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>

              {/* ODP Fields */}
              {type === 'odp' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama ODP</label>
                    <input required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="cth: ODP-TWR-001" className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Jumlah Port</label>
                      <select value={form.capacity || 16} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md">
                        {[4,8,12,16,24,32,48].map(n => <option key={n} value={n}>{n} Port</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Port Terpakai</label>
                      <input type="number" min={0} max={form.capacity || 16} value={form.used_ports || 0}
                        onChange={e => setForm({...form, used_ports: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kode ODP</label>
                    <input value={form.odp_code || ''} onChange={e => setForm({...form, odp_code: e.target.value})}
                      placeholder={`ODP-${Date.now().toString(36).toUpperCase().slice(-4)} (auto)`}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                  </div>
                </>
              )}

              {/* Pole Fields */}
              {type === 'pole' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama Tiang</label>
                    <input required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="cth: Pole-A01" className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tinggi (m)</label>
                      <select value={form.height || 7} onChange={e => setForm({...form, height: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md">
                        {[5,6,7,8,9,10,12].map(n => <option key={n} value={n}>{n}m</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Material</label>
                      <select value={form.material || 'Concrete'} onChange={e => setForm({...form, material: e.target.value})}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md">
                        <option>Concrete</option><option>Steel</option><option>Wood</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Closure Fields */}
              {type === 'closure' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Closure</label>
                  <input required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="cth: Closure-A1" className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                </div>
              )}

              {/* Homepass Fields */}
              {type === 'homepass' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Alamat</label>
                    <input required value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})}
                      placeholder="Alamat lengkap" className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nomor Rumah</label>
                    <input value={form.house_number || ''} onChange={e => setForm({...form, house_number: e.target.value})}
                      placeholder="cth: 42A" className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB CONNECTION */}
          {tab === 'connection' && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/20 rounded-lg border border-border">
                <h3 className="text-sm font-semibold mb-3">Koneksi Sumber (Uplink)</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Parent (Induk)</label>
                    <select value={parentId} onChange={e => setParentId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md">
                      <option value="">-- Tidak ada (standalone) --</option>
                      {(odpList || []).map((odp: any) => (
                        <option key={odp.id} value={odp.id}>
                          {odp.name} ({odp.asset_code}) — {odp.free_ports} port bebas
                        </option>
                      ))}
                    </select>
                    {selectedParent && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Parent: {selectedParent.free_ports}/{selectedParent.capacity} port tersedia
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Kabel Core Ke-</label>
                      <input value={form.cable_core || ''} onChange={e => setForm({...form, cable_core: e.target.value})}
                        placeholder="cth: 2" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Output Core Ke-</label>
                      <input value={form.output_core || ''} onChange={e => setForm({...form, output_core: e.target.value})}
                        placeholder="cth: 1" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Warna Kabel / Tube</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {CABLE_COLORS.map(c => (
                        <button key={c.value} type="button"
                          onClick={() => setForm({...form, cable_color: c.value})}
                          className={`h-8 rounded border-2 text-[9px] transition-all ${form.cable_color === c.value ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}>
                          {form.cable_color === c.value && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Dari Port Parent (Output)</label>
                    <select value={form.from_port || ''} onChange={e => setForm({...form, from_port: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md">
                      <option value="">-- Pilih port --</option>
                      {parentPorts?.ports?.map((p: any) => (
                        <option key={p.number} value={p.number} disabled={p.status === 'used'}>
                          Port {p.number} {p.status === 'used' ? '(terpakai)' : '(bebas)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/20 rounded-lg border border-border">
                <h3 className="text-sm font-semibold mb-3">Input ke Perangkat</h3>
                <div>
                  <label className="block text-xs font-medium mb-1">Masuk ke Port (Input)</label>
                  <input value={form.input_port || ''} onChange={e => setForm({...form, input_port: e.target.value})}
                    placeholder="cth: Port 1" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md" />
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-6 border-t border-border mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-md hover:bg-muted/50 text-sm">
              Batal
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium">
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
