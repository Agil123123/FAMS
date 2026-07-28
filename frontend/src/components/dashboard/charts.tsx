'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function CapacityChart({ capacity }: { capacity: any }) {
  if (!capacity) return null;

  const data = [
    {
      name: 'Ports',
      Used: capacity.usedPorts || 0,
      Available: capacity.availablePorts || 0,
    }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend />
          <Bar dataKey="Used" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
          <Bar dataKey="Available" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AlarmChart({ alarms }: { alarms: any[] }) {
  if (!alarms || alarms.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No active alarms</div>;
  }

  const COLORS = {
    CRITICAL: '#ef4444',
    MAJOR: '#f97316',
    MINOR: '#eab308',
    WARNING: '#3b82f6'
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={alarms}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="count"
            nameKey="severity"
            label
          >
            {alarms.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.severity as keyof typeof COLORS] || '#8884d8'} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
