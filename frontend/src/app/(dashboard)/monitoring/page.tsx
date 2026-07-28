'use client';

import React, { useState } from 'react';
import { 
  useMonitoringDashboard, 
  useAlarms, 
  useDeviceStatuses, 
  useResolveAlarm,
  useTriggerTestAlarm
} from '@/hooks/use-monitoring';
import { formatDistanceToNow } from 'date-fns';
import { 
  Activity, Bell, Server, CheckCircle2, AlertTriangle, XCircle, Zap, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MonitoringPage() {
  const { data: dashboard, isLoading: dashLoading } = useMonitoringDashboard();
  const { data: alarms, isLoading: alarmsLoading } = useAlarms();
  const { data: statuses, isLoading: statusesLoading } = useDeviceStatuses();
  
  const resolveAlarm = useResolveAlarm();
  const triggerAlarm = useTriggerTestAlarm();

  const [testDeviceId, setTestDeviceId] = useState('');

  if (dashLoading || alarmsLoading || statusesLoading) return <div className="p-8">Loading Monitoring Systems...</div>;

  const handleTestAlarm = () => {
    if (!testDeviceId) return;
    triggerAlarm.mutate({
      device_type: 'ONU',
      device_id: testDeviceId,
      severity: 'CRITICAL',
      message: 'Simulated power failure detected.'
    });
    setTestDeviceId('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NOC Monitoring</h1>
          <p className="text-muted-foreground mt-1">Live network telemetry and hardware alarms</p>
        </div>
        <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg border">
          <span className="relative flex h-3 w-3 ml-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold text-muted-foreground pr-2">LIVE SYNC</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alarms</p>
                <h3 className={`text-3xl font-bold mt-1 ${dashboard?.active_alarms && dashboard.active_alarms > 0 ? 'text-red-500' : 'text-foreground'}`}>
                  {dashboard?.active_alarms || 0}
                </h3>
              </div>
              <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 rounded-full">
                <Bell className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline Devices</p>
                <h3 className={`text-3xl font-bold mt-1 ${dashboard?.offline_devices && dashboard.offline_devices > 0 ? 'text-orange-500' : 'text-foreground'}`}>
                  {dashboard?.offline_devices || 0}
                </h3>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 dark:bg-orange-900/30 rounded-full">
                <Server className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Work Orders</p>
                <h3 className="text-3xl font-bold mt-1 text-blue-500">
                  {dashboard?.active_work_orders || 0}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-full">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <h3 className="text-3xl font-bold mt-1 text-green-500">
                  {dashboard?.system_health || 100}%
                </h3>
              </div>
              <div className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        {/* Active Alarm Feed */}
        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Real-time Alarms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {alarms?.filter(a => !a.is_resolved).map(alarm => (
                <div key={alarm.id} className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg flex items-start justify-between group">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">
                        {alarm.severity}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{alarm.device_type}</span>
                    </div>
                    <p className="font-medium text-red-900 dark:text-red-200 text-sm mt-1">{alarm.message}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">{alarm.device_id}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(alarm.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-green-50 hover:text-green-600 border-gray-200"
                    onClick={() => resolveAlarm.mutate(alarm.id)}
                    disabled={resolveAlarm.isPending}
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
              
              {(!alarms || alarms.filter(a => !a.is_resolved).length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500/50 mb-3" />
                  <p>All clear. No active alarms.</p>
                </div>
              )}
            </div>

            {/* Dev Tools - Trigger Alarm */}
            <div className="mt-6 pt-4 border-t flex space-x-2">
              <input 
                placeholder="Device UUID to test..." 
                className="flex-1 text-xs p-2 border rounded font-mono"
                value={testDeviceId}
                onChange={e => setTestDeviceId(e.target.value)}
              />
              <Button size="sm" variant="destructive" onClick={handleTestAlarm} disabled={!testDeviceId}>
                <Zap className="w-4 h-4 mr-2" /> Simulate Alarm
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Device Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Server className="w-5 h-5 mr-2 text-blue-500" />
              Live Hardware Heartbeats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">State</th>
                    <th className="px-4 py-3 font-medium text-right">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {statuses?.map(status => (
                    <tr key={status.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-bold text-foreground text-xs">{status.device_type}</p>
                        <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">{status.device_id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border
                          ${status.status === 'ONLINE' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                            status.status === 'OFFLINE' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
                            'bg-gray-500/10 text-gray-600 border-gray-500/20'}`}
                        >
                          {status.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">
                        {formatDistanceToNow(new Date(status.last_seen), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                  {(!statuses || statuses.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        No hardware registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
