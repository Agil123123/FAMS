import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../lib/api/ai';
import { toast } from 'sonner';

export const useAiChat = () => {
  return useMutation({
    mutationFn: (message: string) => aiApi.chat(message),
    onError: () => toast.error('AI Chat failed'),
  });
};

export const useAiFiberTrace = () => {
  return useMutation({
    mutationFn: (customer_id: string) => aiApi.fiberTrace(customer_id),
    onError: () => toast.error('Fiber Trace analysis failed'),
  });
};

export const useAiNearestOdp = () => {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => aiApi.nearestOdp(lat, lng),
    onError: () => toast.error('Nearest ODP analysis failed'),
  });
};

export const useAiCapacity = () => {
  return useMutation({
    mutationFn: () => aiApi.capacityAnalysis(),
    onError: () => toast.error('Capacity analysis failed'),
  });
};

export const useAiNetwork = () => {
  return useMutation({
    mutationFn: () => aiApi.networkAnalysis(),
    onError: () => toast.error('Network analysis failed'),
  });
};

export const useAiRecommendation = () => {
  return useMutation({
    mutationFn: () => aiApi.recommendation(),
    onError: () => toast.error('Recommendation generation failed'),
  });
};
