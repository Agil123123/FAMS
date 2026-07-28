'use client';

import React from 'react';
import { Users, Home, Activity, AlertTriangle } from 'lucide-react';
import { 
  useDashboardKpis, 
  useDashboardActivity, 
  useDashboardCapacity, 
  useDashboardAlarms 
} from '@/hooks/use-dashboard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { CapacityChart, AlarmChart } from '@/components/dashboard/charts';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { data: kpis, isLoading: kpiLoading } = useDashboardKpis();
  const { data: activities, isLoading: activityLoading } = useDashboardActivity();
  const { data: capacity, isLoading: capacityLoading } = useDashboardCapacity();
  const { data: alarms, isLoading: alarmLoading } = useDashboardAlarms();

  if (kpiLoading || capacityLoading || alarmLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Loading dashboard metrics...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of network capacity, work orders, and active alarms.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Customers"
          value={kpis?.totalCustomers || 0}
          icon={<Users className="w-6 h-6" />}
          description="Active and inactive customers"
        />
        <KpiCard
          title="Total Homepasses"
          value={kpis?.totalHomepasses || 0}
          icon={<Home className="w-6 h-6" />}
          description="Total serviceable locations"
        />
        <KpiCard
          title="Open Work Orders"
          value={kpis?.totalOpenWorkOrders || 0}
          icon={<Activity className="w-6 h-6" />}
          description="Tasks currently pending"
          trend={kpis?.totalOpenWorkOrders ? { value: kpis.totalOpenWorkOrders, isPositive: false } : undefined}
        />
        <KpiCard
          title="Critical Alarms"
          value={kpis?.criticalAlarms || 0}
          icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
          description="Unresolved critical issues"
          trend={kpis?.criticalAlarms ? { value: kpis.criticalAlarms, isPositive: false } : undefined}
        />
      </div>

      {/* Charts & Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capacity Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Network Capacity Utilization</h3>
          <CapacityChart capacity={capacity} />
        </div>

        {/* Alarms Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Active Alarms by Severity</h3>
          <AlarmChart alarms={alarms || []} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Recent Work Order Activities</h3>
        {activityLoading ? (
          <div className="text-muted-foreground text-center py-4">Loading activities...</div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  <span className="text-xs text-muted-foreground/70 mt-2 block">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-8">No recent activities found.</div>
        )}
      </div>
    </div>
  );
}
