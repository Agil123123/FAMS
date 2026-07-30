'use client';

import { useQuery } from '@tanstack/react-query';
import { X, ArrowUp, ArrowDown, ChevronRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Props {
  assetId: string;
  assetType: 'odp' | 'customer';
  assetName?: string;
  onClose: () => void;
  onHighlight?: (geojson: any, direction: 'up' | 'down') => void;
  onClearHighlight?: () => void;
}

export function FiberTracePanel({ assetId, assetType, assetName, onClose, onHighlight, onClearHighlight }: Props) {
  const traceKey = assetType === 'odp' ? `trace-odp-${assetId}` : `trace-customer-${assetId}`;

  const { data, isLoading } = useQuery({
    queryKey: [traceKey],
    queryFn: () => api.get(`/fiber/trace/${assetType}/${assetId}`).then(r => r.data),
    enabled: !!assetId,
  });

  const handleTraceUpstream = () => {
    if (data?.upstream) onHighlight?.(data.upstream, 'up');
  };

  const handleTraceDownstream = () => {
    if (data?.downstream) onHighlight?.(data.downstream, 'down');
  };

  return (
    <div className="absolute right-4 top-20 z-20 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm">
          Fiber Trace: <span className="text-primary">{assetName || assetId?.slice(0,8)}</span>
        </h3>
        <button onClick={() => { onClearHighlight?.(); onClose(); }}
          className="p-1 hover:bg-muted rounded-md"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Tracing fiber...
          </div>
        ) : (
          <>
            <button onClick={handleTraceUpstream} disabled={!data?.upstream}
              className="w-full p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowUp className="w-5 h-5 text-red-400" />
              <div className="text-left"><div className="text-sm font-medium text-red-400">Trace Upstream</div>
                <div className="text-xs text-muted-foreground">Towards OLT</div></div>
            </button>
            <button onClick={handleTraceDownstream} disabled={!data?.downstream}
              className="w-full p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowDown className="w-5 h-5 text-blue-400" />
              <div className="text-left"><div className="text-sm font-medium text-blue-400">Trace Downstream</div>
                <div className="text-xs text-muted-foreground">Towards Customer</div></div>
            </button>

            {data?.path && (data.path as any[]).length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Fiber Path</h4>
                {(data.path as any[]).map((hop: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-mono">{i+1}</span>
                    <span>{hop.name || hop.odp_code || hop.id?.slice(0,8)}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{hop.type}</span>
                    {i < (data.path as any[]).length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
