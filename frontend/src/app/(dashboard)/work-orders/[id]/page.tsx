'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useWorkOrder, 
  useUpdateWorkOrderStatus, 
  useAddTask, 
  useToggleTask, 
  useAddPhoto 
} from '@/hooks/use-work-orders';
import { format } from 'date-fns';
import { 
  Wrench, CheckSquare, Camera, History, ChevronLeft, ArrowRight, Play, CheckCircle2, Lock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATUS_FLOW = ['OPEN', 'ASSIGNED', 'ACCEPTED', 'ON_SITE', 'IN_PROGRESS', 'WAITING_APPROVAL', 'COMPLETED', 'APPROVED', 'CLOSED'];

export default function WorkOrderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const woId = params.id as string;

  const { data: wo, isLoading } = useWorkOrder(woId);
  const updateStatus = useUpdateWorkOrderStatus();
  const addTask = useAddTask();
  const toggleTask = useToggleTask();
  const addPhoto = useAddPhoto();

  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  if (isLoading) return <div className="p-8">Loading Dispatch Board...</div>;
  if (!wo) return <div className="p-8">Work Order not found.</div>;

  const currentIndex = STATUS_FLOW.indexOf(wo.status);
  const nextStatus = currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  const handleNextStatus = () => {
    if (nextStatus) {
      updateStatus.mutate({ id: wo.id, status: nextStatus });
    }
  };

  const handleAddTask = () => {
    if (!newTaskDesc) return;
    addTask.mutate({ id: wo.id, description: newTaskDesc }, {
      onSuccess: () => setNewTaskDesc('')
    });
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl) return;
    addPhoto.mutate({ id: wo.id, photo_url: newPhotoUrl }, {
      onSuccess: () => setNewPhotoUrl('')
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/work-orders')} className="-ml-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Dispatch
        </Button>
        <div className="flex space-x-2">
          {wo.status !== 'CANCELLED' && nextStatus && (
            <Button onClick={handleNextStatus} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={updateStatus.isPending}>
              Transition to {nextStatus}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {wo.status === 'OPEN' && (
            <Button variant="destructive" onClick={() => updateStatus.mutate({ id: wo.id, status: 'CANCELLED' })}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Main Operational Panel */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-t-4 border-t-orange-500">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{wo.title}</h1>
                  <p className="font-mono text-sm text-muted-foreground mt-1">Ticket: {wo.id}</p>
                </div>
                <div className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full text-xs font-bold tracking-wider">
                  {wo.status}
                </div>
              </div>
              <p className="text-muted-foreground">{wo.description || 'No description provided.'}</p>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <CheckSquare className="w-4 h-4 mr-2" />
                Execution Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {wo.tasks?.map(task => (
                  <div key={task.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                      checked={task.is_completed}
                      onChange={(e) => toggleTask.mutate({ taskId: task.id, is_completed: e.target.checked, workOrderId: wo.id })}
                    />
                    <span className={`text-sm ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.description}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2 pt-4 border-t mt-4">
                <input 
                  placeholder="New task description..." 
                  className="flex-1 text-sm p-2 border rounded"
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                />
                <Button size="sm" variant="secondary" onClick={handleAddTask} disabled={!newTaskDesc || addTask.isPending}>Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Photo Documentation Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Camera className="w-4 h-4 mr-2" />
                Field Photos Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {wo.photos?.map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                    <img src={photo.photo_url} alt="Field Documentation" className="object-cover w-full h-full" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                  </div>
                ))}
                {wo.photos?.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    No photos uploaded yet.
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <input 
                  placeholder="Paste Image URL (Mock Upload)" 
                  className="flex-1 text-sm p-2 border rounded"
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                />
                <Button size="sm" variant="outline" onClick={handleAddPhoto} disabled={!newPhotoUrl || addPhoto.isPending}>Upload</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Audit Timeline */}
        <div className="md:col-span-1 space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="flex items-center text-sm">
                <History className="w-4 h-4 mr-2" />
                Audit Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l border-muted-foreground/30 ml-3 space-y-6">
                {wo.histories?.map((history, idx) => (
                  <div key={history.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-background" />
                    <div className="mb-1">
                      <span className="text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded mr-2">
                        {history.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {format(new Date(history.created_at), 'HH:mm:ss')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{history.notes}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">{format(new Date(history.created_at), 'MMM d, yyyy')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
