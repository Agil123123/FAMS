'use client';

import React, { useState } from 'react';
import { useRoles, useDeleteRole } from '@/hooks/use-roles';
import { useAuthStore } from '@/store/auth-store';
import { RoleForm } from '@/components/roles/role-form';
import { toast } from 'sonner';

export default function RolesPage() {
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const { data: roles, isLoading, error } = useRoles();
  const deleteMutation = useDeleteRole();

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      toast.error('System roles cannot be deleted');
      return;
    }
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Role deleted successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  if (!isSuperAdmin) {
    return <div className="p-8 text-center text-destructive">You do not have permission to view this page.</div>;
  }

  if (isCreating || editingRole) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{isCreating ? 'Create Role' : 'Edit Role'}</h1>
          <p className="text-muted-foreground">Manage role details and assigned permissions.</p>
        </div>
        <RoleForm initialData={editingRole} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage system roles and their permissions.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Add New Role
        </button>
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Role Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-center">Type</th>
              <th className="px-4 py-3 font-medium text-center">Permissions Count</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading roles...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-destructive">Failed to load roles</td>
              </tr>
            ) : roles?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No roles found</td>
              </tr>
            ) : (
              roles?.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {item.is_system ? (
                      <span className="px-2 py-1 rounded bg-accent text-accent-foreground text-xs font-semibold">System</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">Custom</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {item.role_permissions?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setEditingRole(item)}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Edit
                    </button>
                    {!item.is_system && (
                      <button
                        onClick={() => handleDelete(item.id, item.is_system)}
                        className="text-destructive hover:underline text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
