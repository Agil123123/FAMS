'use client';

import React, { useState } from 'react';
import { useCustomers, useCreateCustomer } from '@/hooks/use-customers';
import { format } from 'date-fns';
import { Plus, User, Activity, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'TERMINATED': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'WAITING_INSTALLATION': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'DRAFT': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  }
};

export default function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();
  const createMutation = useCreateCustomer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_code: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    odp_id: '' // Will need a real ODP dropdown in prod, but text input for mock
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast.success('Customer created in DRAFT state');
      setIsModalOpen(false);
      setFormData({ customer_code: '', full_name: '', email: '', phone: '', address: '', odp_id: '' });
    } catch (error) {
      toast.error('Failed to create customer');
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage network subscribers and lifecycle states</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Assigned ODP</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers?.map((customer) => (
                  <tr key={customer.id} className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{customer.full_name}</p>
                          <p className="text-xs text-muted-foreground">{customer.customer_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{customer.phone}</p>
                      <p className="text-xs text-muted-foreground">{customer.email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {customer.odp?.name || customer.odp_id || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Manage Profile
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!customers || customers.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
                      <p>No customers found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
            <Dialog.Title className="text-lg font-semibold">Create Customer (DRAFT)</Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Code</label>
                  <input required className="w-full border p-2 rounded-md" value={formData.customer_code} onChange={e => setFormData({...formData, customer_code: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input required className="w-full border p-2 rounded-md" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input required className="w-full border p-2 rounded-md" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" className="w-full border p-2 rounded-md" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <textarea required className="w-full border p-2 rounded-md" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial ODP UUID</label>
                <input required className="w-full border p-2 rounded-md font-mono text-sm" value={formData.odp_id} onChange={e => setFormData({...formData, odp_id: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Saving...' : 'Save Customer'}</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
