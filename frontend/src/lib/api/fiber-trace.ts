import api from '../api';

export interface TraceNode {
  id: string;
  type: string;
  name: string;
  geometry: any;
}

export interface TraceEdge {
  source: string;
  target: string;
  type: string;
}

export interface TraceResult {
  nodes: TraceNode[];
  edges: TraceEdge[];
}

export const fiberTraceApi = {
  traceFromCustomer: async (id: string) => {
    const { data } = await api.get<TraceResult>(`/fiber/trace/customer/${id}`);
    return data;
  },

  traceFromOdp: async (id: string) => {
    const { data } = await api.get<TraceResult>(`/fiber/trace/odp/${id}`);
    return data;
  },

  traceFromCore: async (id: string) => {
    const { data } = await api.get<TraceResult>(`/fiber/trace/core/${id}`);
    return data;
  }
};
