import api from '../api';

export const reportsApi = {
  exportExcel: async () => {
    const response = await api.get('/reports/export/excel', { responseType: 'blob' });
    return response.data;
  },

  exportCsv: async () => {
    const response = await api.get('/reports/export/csv', { responseType: 'blob' });
    return response.data;
  },

  exportPdf: async () => {
    const response = await api.get('/reports/export/pdf', { responseType: 'blob' });
    return response.data;
  },

  scheduleReport: async (payload: { frequency: string; email: string }) => {
    const { data } = await api.post('/reports/schedule', payload);
    return data;
  }
};
