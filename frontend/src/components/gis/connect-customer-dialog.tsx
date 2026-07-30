'use client';

import { useState } from 'react';
import { X, Loader2, Plug } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function ConnectCustomerDialog({ open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [odpId, setOdpId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [port, setPort] = useState('');

  const { data: odps } = useQuery({
    queryKey: ['odps-list-connect'],
    queryFn: () => api.get('/odps').then(r => r.data),
    enabled: open,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-list-connect'],
    queryFn: () => api.get('/customers').then(r => r.data),
    enabled: open,
  });

  // Get available ports for selected ODP
  const { data: odpDetail } = useQuery({
    queryKey: ['odp-connect', odpId],
    queryFn: () => api.get(`/odps/${odpId}`).then(r => r.data),
    enabled: !!odpId,
  });

  const connectCustomer = useMutation({
    mutationFn: (data: any) => api.post('/customers/connect', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gis-customers'] });
      onCreated?.();
      onClose();
      setOdpId(''); setCustomerId(''); setPort('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    connectCustomer.mutate({ odp_id: odpId, customer_id: customerId, port });
  };

  if (!open) return null;

  const usedPorts = odpDetail?.ports?.map((p: any) => p.port_number) || [];
  const availablePorts = Array.from({ length: odpDetail?.capacity || 8 }, (_, i) => i + 1)
    .filter(p => !usedPorts.includes(p));

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2"><Plug className="w-5 h-5 text-primary" /> Connect Customer</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">ODP</label>
            <select required value={odpId} onChange={e => setOdpId(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md">
              <option value="">Select ODP...</option>
              {odps?.map((o: any) => <option key={o.id} value={o.id}>{o.name || o.odp_code}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Customer</label>
            <select required value={customerId} onChange={e => setCustomerId(e.target.value)} disabled={!odpId}
              className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50">
              <option value="">Select customer...</option>
              {customers?.map((c: any) => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Port Number</label>
            <select required value={port} onChange={e => setPort(e.target.value)} disabled={!odpId}
              className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50">
              <option value="">Select port...</option>
              {availablePorts.map(p => <option key={p} value={p}>Port {p}</option>)}
            </select>
            {odpId && <p className="text-xs text-muted-foreground mt-1">{availablePorts.length} ports available of {odpDetail?.capacity || '?'}</p>}
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted/50">Cancel</button>
            <button type="submit" disabled={connectCustomer.isPending || !odpId || !customerId || !port}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {connectCustomer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
