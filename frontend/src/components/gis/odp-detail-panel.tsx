'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { X, Plus, Trash2, ChevronRight, Cable, Split, Plug, GitBranch, Layers } from 'lucide-react';

// Colors for TIA/EIA-598
const CORE_COLORS = [
  'Biru', 'Jingga', 'Hijau', 'Coklat', 'Abu-abu', 'Putih',
  'Merah', 'Hitam', 'Kuning', 'Ungu', 'Merah Muda', 'Toska',
];
const COLOR_HEX: Record<string, string> = {
  'Biru': '#2563eb', 'Jingga': '#ea580c', 'Hijau': '#16a34a', 'Coklat': '#92400e',
  'Abu-abu': '#6b7280', 'Putih': '#f3f4f6', 'Merah': '#dc2626', 'Hitam': '#1f2937',
  'Kuning': '#eab308', 'Ungu': '#7c3aed', 'Merah Muda': '#ec4899', 'Toska': '#14b8a6',
};
const SPLICE_TYPES = ['fusion', 'mechanical', 'connector', 'pigtail'];

interface Props {
  odpId: string;
  onClose: () => void;
}

export default function OdpDetailPanel({ odpId, onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'info' | 'splices' | 'splitters'>('info');
  const [showSpliceForm, setShowSpliceForm] = useState(false);
  const [showSplitterForm, setShowSplitterForm] = useState(false);

  // Splice form
  const [spliceForm, setSpliceForm] = useState({
    tray_number: 1,
    source_type: 'cable_core', source_label: '', source_core: undefined as number | undefined,
    target_type: 'cable_core', target_label: '', target_core: undefined as number | undefined,
    splice_type: 'fusion', attenuation: undefined as number | undefined, notes: '',
  });

  // Splitter form
  const [splitterTypeId, setSplitterTypeId] = useState('');

  const { data: detail, isLoading } = useQuery({
    queryKey: ['odpDetail', odpId],
    queryFn: () => api.get(`/gis/odps/${odpId}`).then(r => r.data),
    enabled: !!odpId,
  });

  const { data: splitterTypes } = useQuery({
    queryKey: ['splitterTypes'],
    queryFn: () => api.get('/splitter-types').then(r => r.data),
  });

  const spliceMutation = useMutation({
    mutationFn: (data: any) => api.post(`/gis/odps/${odpId}/splices`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['odpDetail', odpId] }); setShowSpliceForm(false); },
  });

  const deleteSpliceMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/gis/splices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['odpDetail', odpId] }),
  });

  const splitterMutation = useMutation({
    mutationFn: () => api.post(`/gis/odps/${odpId}/splitters`, { splitter_type_id: splitterTypeId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['odpDetail', odpId] }); setShowSplitterForm(false); },
  });

  if (isLoading) return null;

  const d = detail;

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[420px] bg-white border-l shadow-xl z-[3000] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white shrink-0">
        <div>
          <h3 className="font-bold text-lg">{d?.name}</h3>
          <p className="text-xs text-blue-100">{d?.asset_code}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-blue-500 rounded"><X size={18} /></button>
      </div>

      {/* Tabs */}
      <div className="flex border-b shrink-0">
        {[
          { key: 'info', label: 'Info', icon: Layers },
          { key: 'splices', label: `Splice (${d?.splices?.length || 0})`, icon: GitBranch },
          { key: 'splitters', label: `Splitter (${d?.splitters?.length || 0})`, icon: Split },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 ${tab === t.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'info' && <InfoTab detail={d} />}
        {tab === 'splices' && (
          <SpliceTab
            splices={d?.splices || []}
            showForm={showSpliceForm}
            setShowForm={setShowSpliceForm}
            form={spliceForm}
            setForm={setSpliceForm}
            onSubmit={() => spliceMutation.mutate(spliceForm)}
            onDelete={(id) => deleteSpliceMutation.mutate(id)}
            loading={spliceMutation.isPending}
          />
        )}
        {tab === 'splitters' && (
          <SplitterTab
            splitters={d?.splitters || []}
            showForm={showSplitterForm}
            setShowForm={setShowSplitterForm}
            types={splitterTypes || []}
            selectedType={splitterTypeId}
            setSelectedType={setSplitterTypeId}
            onSubmit={() => splitterMutation.mutate()}
            loading={splitterMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// INFO TAB — Upstream + Links + Customers
// ============================================================
function InfoTab({ detail: d }: { detail: any }) {
  return (
    <div className="space-y-5">
      {/* Coordinates */}
      {d?.coordinates && (
        <Section title="Koordinat">
          <p className="text-sm text-gray-600 font-mono">
            {d.coordinates[0].toFixed(6)}, {d.coordinates[1].toFixed(6)}
          </p>
        </Section>
      )}

      {/* Upstream Path */}
      {d?.upstream && (
        <Section title="⬆️ Jalur Upstream" icon={<Cable size={14} />}>
          <PathRow label="OLT" name={d.upstream.olt.name} code={d.upstream.olt.code} last />
          <PathRow label="PON Port" name={`Port ${d.upstream.pon_port.index}`} code={d.upstream.pon_port.id?.slice(-8)} />
          <PathRow label="ODC" name={d.upstream.odc.name} code={d.upstream.odc.code} />
          <PathRow label="Closure" name={d.upstream.closure.name} code={d.upstream.closure.code} />
        </Section>
      )}

      {/* Outgoing Links */}
      {(d?.outgoing_links?.length > 0) && (
        <Section title="🔗 Koneksi Ke ODP Lain" icon={<ChevronRight size={14} />}>
          {d.outgoing_links.map((l: any) => (
            <div key={l.id} className="flex items-center gap-2 text-sm py-1.5 px-2 bg-blue-50 rounded border border-blue-100">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_HEX[l.cable_color] || '#f59e0b' }} />
              <span className="font-medium">{l.to_name}</span>
              <span className="text-gray-400 text-xs">{l.to_code}</span>
              <span className="ml-auto text-xs text-gray-500">
                Port {l.from_port} → Port {l.to_port}
                {l.cable_core && ` · Core ${l.cable_core}`}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Incoming Links */}
      {(d?.incoming_links?.length > 0) && (
        <Section title="📥 Koneksi Dari ODP Lain" icon={<ChevronRight size={14} />}>
          {d.incoming_links.map((l: any) => (
            <div key={l.id} className="flex items-center gap-2 text-sm py-1.5 px-2 bg-green-50 rounded border border-green-100">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_HEX[l.cable_color] || '#f59e0b' }} />
              <span className="font-medium">{l.from_name}</span>
              <span className="text-gray-400 text-xs">{l.from_code}</span>
              <span className="ml-auto text-xs text-gray-500">
                Port {l.from_port} → Port {l.to_port}
                {l.cable_core && ` · Core ${l.cable_core}`}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Customers */}
      {(d?.customers?.length > 0) && (
        <Section title="👥 Pelanggan" icon={<Plug size={14} />}>
          {d.customers.map((c: any) => (
            <div key={c.id} className="flex items-center gap-2 text-sm py-1">
              <span className="font-medium">{c.full_name}</span>
              <span className="text-gray-400 text-xs">{c.customer_code}</span>
              <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {c.status}
              </span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

// ============================================================
// SPLICE TAB
// ============================================================
function SpliceTab({ splices, showForm, setShowForm, form, setForm, onSubmit, onDelete, loading }: {
  splices: any[]; showForm: boolean; setShowForm: (v: boolean) => void;
  form: any; setForm: (f: any) => void;
  onSubmit: () => void; onDelete: (id: string) => void; loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-gray-700">Cross-Connect / Splicing</h4>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          <Plus size={14} /> Tambah
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Sumber (Incoming)</label>
              <select className="w-full text-sm border rounded px-2 py-1" value={form.source_type}
                onChange={e => setForm({ ...form, source_type: e.target.value })}>
                <option value="cable_core">Kabel (Core)</option>
                <option value="splitter_output">Splitter (Output)</option>
                <option value="pon_feeder">PON Feeder</option>
                <option value="pigtail">Pigtail</option>
                <option value="cross_connect">Cross-connect</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Tujuan (Target)</label>
              <select className="w-full text-sm border rounded px-2 py-1" value={form.target_type}
                onChange={e => setForm({ ...form, target_type: e.target.value })}>
                <option value="cable_core">Kabel (Core)</option>
                <option value="splitter_input">Splitter (Input)</option>
                <option value="odp_port">ODP Port</option>
                <option value="pigtail">Pigtail</option>
                <option value="cross_connect">Cross-connect</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <input className="flex-1 text-sm border rounded px-2 py-1" placeholder="Label sumber (cth: Kabel 12C Core 3)"
              value={form.source_label} onChange={e => setForm({ ...form, source_label: e.target.value })} />
            <input className="flex-1 text-sm border rounded px-2 py-1" placeholder="Label target (cth: Core 7 ke ODP-B)"
              value={form.target_label} onChange={e => setForm({ ...form, target_label: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <input type="number" className="w-20 text-sm border rounded px-2 py-1" placeholder="Core Sumber"
              value={form.source_core || ''} onChange={e => setForm({ ...form, source_core: parseInt(e.target.value) || undefined })} />
            <input type="number" className="w-20 text-sm border rounded px-2 py-1" placeholder="Core Target"
              value={form.target_core || ''} onChange={e => setForm({ ...form, target_core: parseInt(e.target.value) || undefined })} />
            <input type="number" className="w-16 text-sm border rounded px-2 py-1" placeholder="Tray"
              value={form.tray_number} onChange={e => setForm({ ...form, tray_number: parseInt(e.target.value) || 1 })} />
            <select className="text-sm border rounded px-2 py-1" value={form.splice_type}
              onChange={e => setForm({ ...form, splice_type: e.target.value })}>
              {SPLICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" step="0.01" className="w-16 text-sm border rounded px-2 py-1" placeholder="dB"
              value={form.attenuation || ''} onChange={e => setForm({ ...form, attenuation: parseFloat(e.target.value) || undefined })} />
          </div>
          <div className="flex gap-2">
            <input className="flex-1 text-sm border rounded px-2 py-1" placeholder="Catatan"
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <button onClick={onSubmit} disabled={loading || !form.source_label || !form.target_label}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? '...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {splices.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-4">Belum ada splice record</p>
      )}

      {splices.map((s: any) => (
        <div key={s.id} className="border rounded-lg p-3 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">Tray {s.tray_number}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{s.splice_type}</span>
                {s.attenuation != null && <span className="text-xs text-gray-500">{s.attenuation} dB</span>}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="font-medium text-green-700">{s.source_label}</span>
                {s.source_core && <span className="text-xs text-gray-400">Core {s.source_core}</span>}
                <span className="text-gray-300">→</span>
                <span className="font-medium text-purple-700">{s.target_label}</span>
                {s.target_core && <span className="text-xs text-gray-400">Core {s.target_core}</span>}
              </div>
              <div className="flex gap-2 mt-1 text-xs text-gray-400">
                <span>{s.source_type}</span><span>→</span><span>{s.target_type}</span>
              </div>
            </div>
            <button onClick={() => onDelete(s.id)} className="p-1 text-gray-300 hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SPLITTER TAB
// ============================================================
function SplitterTab({ splitters, showForm, setShowForm, types, selectedType, setSelectedType, onSubmit, loading }: {
  splitters: any[]; showForm: boolean; setShowForm: (v: boolean) => void;
  types: any[]; selectedType: string; setSelectedType: (v: string) => void;
  onSubmit: () => void; loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-gray-700">Passive Splitter Terpasang</h4>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
          <Plus size={14} /> Tambah
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
          <label className="text-xs text-gray-500">Tipe Splitter</label>
          <select className="w-full text-sm border rounded px-2 py-1" value={selectedType}
            onChange={e => setSelectedType(e.target.value)}>
            <option value="">-- Pilih tipe --</option>
            {types?.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name} ({t.ratio_in}:{t.ratio_out})</option>
            ))}
          </select>
          <button onClick={onSubmit} disabled={loading || !selectedType}
            className="w-full py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50">
            {loading ? '...' : 'Install Splitter'}
          </button>
        </div>
      )}

      {splitters.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-4">Belum ada splitter terpasang</p>
      )}

      {splitters.map((s: any) => (
        <div key={s.id} className="border rounded-lg p-3 bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Split size={16} className="text-green-600" />
              <span className="font-medium text-sm">{s.type_name || 'Splitter'}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Ratio {s.ratio_in}:{s.ratio_out} · {s.asset_code}
            </p>
          </div>
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">Active</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        {icon} {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function PathRow({ label, name, code, last }: { label: string; name: string; code?: string; last?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm py-1.5">
      {!last && <div className="w-5 flex justify-center"><div className="w-0.5 h-4 bg-blue-200" /></div>}
      {last && <div className="w-5" />}
      <span className="font-mono text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded w-20 text-center shrink-0">{label}</span>
      <span className="font-medium">{name}</span>
      {code && <span className="text-xs text-gray-400 ml-auto">{code}</span>}
    </div>
  );
}
