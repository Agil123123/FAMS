import api from '../api';

export interface AiChatResponse {
  type: string;
  prompt_used: string;
  message?: string;
  context?: any;
  health_score?: number;
  metrics?: any;
  attention_areas?: string[];
  summary?: any;
  high_utilization_odps?: any[];
  analysis?: any;
  results?: any[];
  coordinates?: { lat: number; lng: number };
  generated_at?: string;
  total_recommendations?: number;
  recommendations?: any[];
}

export const aiApi = {
  chat: async (message: string) => {
    const { data } = await api.post<AiChatResponse>('/ai/chat', { message });
    return data;
  },

  fiberTrace: async (customer_id: string) => {
    const { data } = await api.post<AiChatResponse>('/ai/fiber-trace', { customer_id });
    return data;
  },

  nearestOdp: async (lat: number, lng: number) => {
    const { data } = await api.post<AiChatResponse>('/ai/nearest-odp', { lat, lng });
    return data;
  },

  capacityAnalysis: async () => {
    const { data } = await api.post<AiChatResponse>('/ai/capacity-analysis');
    return data;
  },

  networkAnalysis: async () => {
    const { data } = await api.post<AiChatResponse>('/ai/network-analysis');
    return data;
  },

  recommendation: async () => {
    const { data } = await api.post<AiChatResponse>('/ai/recommendation');
    return data;
  },
};
