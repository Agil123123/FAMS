'use client';
import { useState } from 'react';
import { Activity, Wifi, Signal, Play, Pause, Settings, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function MonitoringPage() {
  const queryClient = useQueryClient();
  const [showConfig, setShowConfig] = useState(false);

  const { data: status } = useQuery({
    queryKey: ['monitoring-status'],
    queryFn: () => api.get('/monitoring/status').then(r => r.data),
    refetchInterval: 5000,
  });

  const { data: config } = useQuery({
    queryKey: ['monitoring-config'],
    queryFn: () => api.get('/monitoring/config').then(r => r.data),
  });

  const { data: events } = useQuery({
    queryKey: ['monitoring-events'],
    queryFn: () => api.get('/monitoring/events').then(r => r.data),
    refetchInterval: 10000,
  });

  const startMt = useMutation({
    mutationFn: () => api.post('/monitoring/start'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitoring-status'] }),
  });

  const stopMt = useMutation({
    mutationFn: () => api.post('/monitoring/stop'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitoring-status'] }),
  });

  const saveConfig = useMutation({
    mutationFn: (data: any) => api.post('/monitoring/config', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-config'] });
      setShowConfig(false);
    },
  });

  const [form, setForm] = useState<any>({});

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Activity className="w-6 h-6" /> Monitoring Real-time
          </h1>
          <p className="text-muted-foreground text-sm mt-1">PPPoE + RX Power monitor</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50">
            <Settings className="w-4 h-4" /> Konfigurasi
          </button>
          {status?.running ? (
            <button onClick={() => stopMt.mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              <Pause className="w-4 h-4" /> Stop
            </button>
          ) : (
            <button onClick={() => startMt.mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Play className="w-4 h-4" /> Start
            </button>
          )}
        </div>
      </div>

      {/* STATUS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Activity className="w-4 h-4" /> Status</div>
          <div className={`text-lg font-bold ${status?.running ? 'text-green-500' : 'text-red-500'}`}>
            {status?.running ? 'RUNNING' : 'STOPPED'}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Wifi className="w-4 h-4" /> PPPoE</div>
          <div className="text-lg font-bold">{config?.pppoe_enabled ? 'Enabled' : 'Disabled'}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Signal className="w-4 h-4" /> RX Power</div>
          <div className="text-lg font-bold">{config?.rx_enabled ? `Warn: ${config.rx_warning} / Crit: ${config.rx_critical} dBm` : 'Disabled'}</div>
        </div>
      </div>

      {/* CONFIG FORM */}
      {showConfig && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Konfigurasi MikroTik & Monitoring</h2>
          <form onSubmit={e => { e.preventDefault(); saveConfig.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm mb-1">MikroTik Host</label>
                <input value={form.mikrotik_host || config?.mikrotik_host || ''} onChange={e => setForm({...form, mikrotik_host: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div><label className="block text-sm mb-1">Port API</label>
                <input type="number" value={form.mikrotik_port || config?.mikrotik_port || 8728} onChange={e => setForm({...form, mikrotik_port: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div><label className="block text-sm mb-1">Username</label>
                <input value={form.mikrotik_user || config?.mikrotik_user || ''} onChange={e => setForm({...form, mikrotik_user: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div><label className="block text-sm mb-1">Password</label>
                <input type="password" value={form.mikrotik_pass || config?.mikrotik_pass || ''} onChange={e => setForm({...form, mikrotik_pass: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm mb-1">Check Interval (s)</label>
                <input type="number" value={form.check_interval || config?.check_interval || 60} onChange={e => setForm({...form, check_interval: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div><label className="block text-sm mb-1">RX Warning (dBm)</label>
                <input type="number" step="0.1" value={form.rx_warning ?? config?.rx_warning ?? -27} onChange={e => setForm({...form, rx_warning: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
              <div><label className="block text-sm mb-1">RX Critical (dBm)</label>
                <input type="number" step="0.1" value={form.rx_critical ?? config?.rx_critical ?? -30} onChange={e => setForm({...form, rx_critical: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md" /></div>
            </div>
            <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-md">Simpan Konfigurasi</button>
          </form>
        </div>
      )}

      {/* EVENTS LOG */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-semibold">Monitoring Events</h2>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['monitoring-events'] })}
            className="p-1 hover:bg-muted rounded"><RefreshCw className="w-4 h-4" /></button>
        </div>
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {(events || []).length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">Belum ada event. Start monitoring dulu.</div>
          )}
          {(events || []).map((e: any) => (
            <div key={e.id} className="px-5 py-3 text-sm flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                e.severity === 'critical' ? 'bg-red-500' : e.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase">{e.event_type}</span>
                  <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="mt-0.5">{e.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
