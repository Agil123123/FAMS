'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/lib/api/users';
import { useCreateUser, useUpdateUser } from '@/hooks/use-users';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Full name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: User;
}

export function UserForm({ initialData }: UserFormProps) {
  const router = useRouter();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: initialData?.username || '',
      email: initialData?.email || '',
      full_name: initialData?.full_name || '',
      phone: initialData?.phone || '',
      password: '',
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (isEditing && initialData) {
        // Remove empty password if not changing
        if (!data.password) {
          delete data.password;
        }
        await updateMutation.mutateAsync({ id: initialData.id, payload: data });
        toast.success('User updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('User created successfully');
      }
      router.push('/users');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          {...register('username')}
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="johndoe"
        />
        {errors.username && <p className="text-destructive text-sm mt-1">{errors.username.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          {...register('full_name')}
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="John Doe"
        />
        {errors.full_name && <p className="text-destructive text-sm mt-1">{errors.full_name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
        <input
          {...register('phone')}
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="+1234567890"
        />
        {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
        </label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
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
          {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}
