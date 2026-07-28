'use client';

import React from 'react';
import { useSystemHealth } from '@/hooks/use-system';
import { Activity, Server, Database, Clock, MemoryStick, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HealthPage() {
  const { data: health, isLoading, isError } = useSystemHealth();

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (isError || !health) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Failed to retrieve system health metrics. The backend server might be offline.
        </div>
      </div>
    );
  }

  const isHealthy = health.status === 'healthy';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Activity className="w-8 h-8 mr-3 text-primary" />
            System Health
          </h1>
          <p className="text-muted-foreground mt-1">Real-time infrastructure monitoring</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center text-sm font-bold shadow-sm border ${isHealthy ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
          {isHealthy ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          SYSTEM {health.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Database className="w-4 h-4 mr-2" />
              PostgreSQL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${health.components.database.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-2xl font-bold capitalize">{health.components.database.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Prisma ORM Connection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Server className="w-4 h-4 mr-2" />
              Redis Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${health.components.redis.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-2xl font-bold capitalize">{health.components.redis.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">BullMQ Queue Backend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <MemoryStick className="w-4 h-4 mr-2" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{health.system.memory_usage_mb} MB</span>
            <p className="text-xs text-muted-foreground mt-1">Node.js Heap Used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Server Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {(health.system.uptime_seconds / 3600).toFixed(1)} hrs
            </span>
            <p className="text-xs text-muted-foreground mt-1">Continuous operation</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-right text-xs text-muted-foreground">
        Last updated: {new Date(health.timestamp).toLocaleTimeString()} (auto-refreshes every 30s)
      </div>
    </div>
  );
}
