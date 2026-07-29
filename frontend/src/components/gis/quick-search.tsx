'use client';
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import api from '@/lib/api';

interface Props { onSelect: (item: { type: string; id: string; name: string; lng: number; lat: number }) => void; }

export function QuickSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const [odps, olts, customers, cables, assets] = await Promise.allSettled([
          api.get(`/odps?search=${query}`).then(r => (r.data || []).map((i: any) => ({ ...i, _type: 'ODP' }))),
          api.get(`/olts?search=${query}`).then(r => (r.data || []).map((i: any) => ({ ...i, _type: 'OLT' }))),
          api.get(`/customers?search=${query}`).then(r => (r.data || []).map((i: any) => ({ ...i, _type: 'Customer' }))),
          api.get(`/fiber/cables?search=${query}`).then(r => (r.data || []).map((i: any) => ({ ...i, _type: 'Cable' }))),
          api.get(`/assets?search=${query}`).then(r => (r.data || []).map((i: any) => ({ ...i, _type: i.asset_type?.name || 'Asset' }))),
        ]);
        const all = [odps, olts, customers, cables, assets]
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
          .flatMap(r => r.value)
          .slice(0, 20);
        setResults(all);
        setOpen(all.length > 0);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [query]);

  const handleSelect = (item: any) => {
    onSelect({ type: item._type, id: item.id, name: item.name || item.odp_code || item.email || item.id, lng: item.longitude || 0, lat: item.latitude || 0 });
    setOpen(false); setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search assets, ODP, customers... (S)"
          className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-50">
          {results.map((item: any, i: number) => (
            <button key={i} onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-800 text-sm text-left">
              <span className="text-xs font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 w-16 text-center shrink-0">{item._type}</span>
              <span className="truncate">{item.name || item.odp_code || item.email || item.asset_code || item.id?.slice(0,8)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
