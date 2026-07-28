import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { useAuthStore } from '../store/auth-store';
import { LoginCredentials, AuthResponse, IUser } from '../types/auth.types';
import { toast } from 'sonner'; // Assuming sonner or similar is used for Toast as per specs

export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // API response mapping: assuming it returns { user, access_token, refresh_token } inside `data` or directly
      // Adjust according to the NestJS response format
      const payload = (data as any).data || data; 
      
      setAuth(payload.user, payload.access_token, payload.refresh_token);
      
      // Also save token in cookie for middleware (optional)
      document.cookie = `fams_access_token=${payload.access_token}; path=/; max-age=86400`; // 1 day
      
      toast.success('Login successful');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Invalid email or password';
      toast.error(message);
    },
  });
};

export const useLogoutMutation = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      clearAuth();
      document.cookie = 'fams_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      queryClient.clear();
      router.push('/login');
    },
  });
};

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<{ data: IUser }>('/auth/profile');
      return response.data.data;
    },
  });
};
