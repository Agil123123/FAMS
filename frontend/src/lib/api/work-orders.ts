import api from '../api';

export interface WorkOrderTask {
  id: string;
  description: string;
  is_completed: boolean;
  created_at: string;
}

export interface WorkOrderPhoto {
  id: string;
  photo_url: string;
  created_at: string;
}

export interface WorkOrderHistory {
  id: string;
  status: string;
  notes: string;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  tasks?: WorkOrderTask[];
  photos?: WorkOrderPhoto[];
  histories?: WorkOrderHistory[];
}

export type CreateWorkOrderInput = Pick<WorkOrder, 'title' | 'description'>;

export const workOrdersApi = {
  getAll: async () => {
    const { data } = await api.get<WorkOrder[]>('/work-orders');
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<WorkOrder>(`/work-orders/${id}`);
    return data;
  },

  create: async (workOrder: CreateWorkOrderInput) => {
    const { data } = await api.post<WorkOrder>('/work-orders', workOrder);
    return data;
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const { data } = await api.post<WorkOrder>(`/work-orders/${id}/status`, { status, notes });
    return data;
  },

  addTask: async (id: string, description: string) => {
    const { data } = await api.post(`/work-orders/${id}/tasks`, { description });
    return data;
  },

  toggleTask: async (taskId: string, is_completed: boolean) => {
    const { data } = await api.patch(`/work-orders/tasks/${taskId}/toggle`, { is_completed });
    return data;
  },

  addPhoto: async (id: string, photo_url: string) => {
    const { data } = await api.post(`/work-orders/${id}/photos`, { photo_url });
    return data;
  },
};
