import api from '../api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

export const notificationsApi = {
  getInApp: async () => {
    const { data } = await api.get<Notification[]>('/notifications');
    return data;
  },

  testNotification: async (payload: { title: string; message: string; type: string; channels: string[] }) => {
    const { data } = await api.post('/notifications/test', payload);
    return data;
  }
};
