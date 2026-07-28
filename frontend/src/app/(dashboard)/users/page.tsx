'use client';

import React, { useState } from 'react';
import { useUsers, useDeleteUser } from '@/hooks/use-users';
import { useAuthStore } from '@/store/auth-store';
import { UserForm } from '@/components/users/user-form';
import { toast } from 'sonner';

export default function UsersPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data, isLoading, error } = useUsers({ page, limit: 10, search });
  const deleteMutation = useDeleteUser();

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (!isSuperAdmin && !user?.roles?.includes('ADMINISTRATOR')) {
    return <div className="p-8 text-center text-destructive">You do not have permission to view this page.</div>;
  }

  if (isCreating || editingUser) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{isCreating ? 'Create User' : 'Edit User'}</h1>
          <p className="text-muted-foreground">Fill in the details below.</p>
        </div>
        <UserForm initialData={editingUser} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and access.</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Add New User
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-w-[300px]"
        />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Full Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading users...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-destructive">Failed to load users</td>
              </tr>
            ) : data?.data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found</td>
              </tr>
            ) : (
              data?.data?.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">{item.username}</td>
                  <td className="px-4 py-3">{item.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(item as any).user_roles?.map((ur: any) => (
                      <span key={ur.role.name} className="mr-1 px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        {ur.role.name}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {isSuperAdmin && (
                      <>
                        <button
                          onClick={() => setEditingUser(item)}
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data?.meta && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing {(data.meta.page - 1) * data.meta.limit + 1} to {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of {data.meta.total} users
          </div>
          <div className="space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border border-border rounded disabled:opacity-50 hover:bg-muted"
            >
              Previous
            </button>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-border rounded disabled:opacity-50 hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
