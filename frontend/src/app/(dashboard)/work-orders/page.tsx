'use client';

import React, { useState } from 'react';
import { useWorkOrders, useCreateWorkOrder } from '@/hooks/use-work-orders';
import { format } from 'date-fns';
import { Plus, Wrench, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'ASSIGNED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'IN_PROGRESS': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'WAITING_APPROVAL': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'COMPLETED': 
    case 'CLOSED': 
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export default function WorkOrdersPage() {
  const { data: workOrders, isLoading } = useWorkOrders();
  const createMutation = useCreateWorkOrder();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setIsModalOpen(false);
    setFormData({ title: '', description: '' });
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground mt-1">Manage field dispatch, installations, and repairs</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Work Order
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket</th>
                  <th className="px-6 py-4 font-medium">Progress</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {workOrders?.map((wo) => {
                  const totalTasks = wo.tasks?.length || 0;
                  const completedTasks = wo.tasks?.filter(t => t.is_completed).length || 0;
                  const progressPct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                  return (
                    <tr key={wo.id} className="bg-background hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{wo.title}</p>
                            <p className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">{wo.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${progressPct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{completedTasks}/{totalTasks}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(wo.status)}`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(wo.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/work-orders/${wo.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Open Dispatch
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(!workOrders || workOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
                      <p>No active work orders.</p>
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
            <Dialog.Title className="text-lg font-semibold">New Work Order</Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input required className="w-full border p-2 rounded-md" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Fiber Install - Site A" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea className="w-full border p-2 rounded-md h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Scope of work details..." />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Processing...' : 'Dispatch Work Order'}</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
