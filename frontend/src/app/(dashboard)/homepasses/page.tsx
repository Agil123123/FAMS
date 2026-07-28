'use client';

import React, { useState } from 'react';
import { useHomepasses, useCreateHomepass, useUpdateHomepass, useDeleteHomepass } from '@/hooks/use-homepasses';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as Dialog from '@radix-ui/react-dialog';

export default function HomepassesPage() {
  const { data: homepasses, isLoading } = useHomepasses();
  const createMutation = useCreateHomepass();
  const updateMutation = useUpdateHomepass();
  const deleteMutation = useDeleteHomepass();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHomepass, setEditingHomepass] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
  });

  const openCreateModal = () => {
    setEditingHomepass(null);
    setFormData({ name: '', address: '', latitude: -6.200000, longitude: 106.816666 });
    setIsModalOpen(true);
  };

  const openEditModal = (hp: any) => {
    setEditingHomepass(hp);
    setFormData({ 
      name: hp.name, 
      address: hp.address,
      latitude: hp.latitude,
      longitude: hp.longitude
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      };

      if (editingHomepass) {
        await updateMutation.mutateAsync({ id: editingHomepass.id, data: payload });
        toast.success('Homepass updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Homepass created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this homepass?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Homepass deleted successfully');
      } catch (error) {
        toast.error('Failed to delete homepass');
      }
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepasses</h1>
          <p className="text-muted-foreground mt-1">Manage physical pre-sales structural entities</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Homepass
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Address</th>
                  <th className="px-6 py-4 font-medium">Coordinates</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {homepasses?.map((hp) => (
                  <tr key={hp.id} className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{hp.name}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={hp.address}>
                      {hp.address}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">
                      {hp.latitude.toFixed(5)}, {hp.longitude.toFixed(5)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(hp.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(hp)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(hp.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!homepasses || homepasses.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No homepasses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Inline Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
            <Dialog.Title className="text-lg font-semibold">
              {editingHomepass ? 'Edit Homepass' : 'Create Homepass'}
            </Dialog.Title>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  required
                  type="text"
                  className="w-full border p-2 rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <textarea
                  required
                  className="w-full border p-2 rounded-md h-24"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    className="w-full border p-2 rounded-md font-mono text-sm"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    className="w-full border p-2 rounded-md font-mono text-sm"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
