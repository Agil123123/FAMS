'use client';

import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KpiCard({ title, value, icon, description, trend }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
          <div className="text-3xl font-bold text-primary mt-1">{value}</div>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-md">
          {icon}
        </div>
      </div>
      
      {(description || trend) && (
        <div className="flex items-center text-sm">
          {trend && (
            <span className={`font-medium mr-2 flex items-center ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
          {description && <span className="text-muted-foreground">{description}</span>}
        </div>
      )}
    </div>
  );
}
