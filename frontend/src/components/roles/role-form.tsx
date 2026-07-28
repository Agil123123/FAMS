'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Role } from '@/lib/api/roles';
import { Permission } from '@/lib/api/permissions';
import { useCreateRole, useUpdateRole } from '@/hooks/use-roles';
import { usePermissions } from '@/hooks/use-permissions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  permission_ids: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialData?: Role;
}

export function RoleForm({ initialData }: RoleFormProps) {
  const router = useRouter();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const { data: allPermissions, isLoading: isLoadingPermissions } = usePermissions();

  const isEditing = !!initialData;
  const isSystemRole = initialData?.is_system;

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialData?.role_permissions?.map(rp => rp.permission_id) || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      permission_ids: initialData?.role_permissions?.map(rp => rp.permission_id) || [],
    },
  });

  useEffect(() => {
    setValue('permission_ids', selectedPermissions);
  }, [selectedPermissions, setValue]);

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: RoleFormValues) => {
    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload: data });
        toast.success('Role updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Role created successfully');
      }
      router.push('/roles');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  // Group permissions by module
  const groupedPermissions = allPermissions?.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>) || {};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Role Name</label>
          <input
            {...register('name')}
            disabled={isSystemRole}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            placeholder="e.g. MANAGER"
          />
          {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
          {isSystemRole && <p className="text-muted-foreground text-xs mt-1">System roles cannot be renamed.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (Optional)</label>
          <input
            {...register('description')}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Role description"
          />
          {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 border-b border-border pb-2">Permissions</h3>
        {isLoadingPermissions ? (
          <div className="text-muted-foreground text-sm">Loading permissions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <div key={module} className="border border-border rounded-md p-4 bg-card">
                <h4 className="font-semibold text-primary capitalize mb-3">{module}</h4>
                <div className="space-y-2">
                  {perms.map(perm => (
                    <label key={perm.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded border-border text-primary focus:ring-primary bg-background"
                      />
                      <span className="text-sm">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-border rounded-md hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role'}
        </button>
      </div>
    </form>
  );
}
