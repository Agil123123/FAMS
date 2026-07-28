'use client';

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/auth-store';
import { Permission } from '@/lib/api/permissions';

export default function PermissionsPage() {
  const { user } = useAuthStore();
  const { data: permissions, isLoading, error } = usePermissions();

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  if (!isSuperAdmin) {
    return <div className="p-8 text-center text-destructive">You do not have permission to view this page.</div>;
  }

  // Group permissions by module
  const groupedPermissions = permissions?.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>) || {};

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Permissions Directory</h1>
          <p className="text-muted-foreground">View all system-defined permissions grouped by module. Permissions are hardcoded into the system and cannot be modified.</p>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading permissions...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">Failed to load permissions.</div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No permissions found.</div>
        ) : (
          Object.entries(groupedPermissions).map(([module, perms]) => (
            <div key={module} className="border border-border rounded-md overflow-hidden bg-card">
              <div className="bg-muted px-4 py-3 font-semibold text-primary capitalize border-b border-border">
                {module.replace('_', ' ')} Module
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {perms.map(perm => (
                  <div key={perm.id} className="border border-border rounded p-3 bg-background hover:border-primary/50 transition-colors">
                    <div className="font-medium text-sm mb-1">{perm.name}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{perm.action}</div>
                    {perm.description && (
                      <div className="text-xs text-muted-foreground mt-2">{perm.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
