import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/auth.service';

// Extend AxiosRequestConfig to include custom retry flags
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token
api.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh queue properties
let isRefreshing = false;
interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}
let failedQueue: PendingRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || '');
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle errors and refresh tokens with queue merging
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // Check if error status is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          console.log('[API Interceptor] Token expired. Attempting token refresh queue handler...');
          
          // Re-inject token refresh call using authService mock
          const refreshed = await authService.refreshToken(refreshToken);
          
          const user = useAuthStore.getState().user;
          if (!user) throw new Error('No active user session');
          
          // Save the refreshed credentials
          useAuthStore.getState().login({
            token: refreshed.token,
            refreshToken: refreshed.refreshToken,
            user,
          });
          
          console.log('[API Interceptor] Token refreshed successfully. Replaying queue...');
          
          // Re-inject token into the headers and retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
          }
          
          processQueue(null, refreshed.token);
          isRefreshing = false;
          
          return api(originalRequest);
        } catch (refreshError) {
          console.error('[API Interceptor] Token refresh failed. Flushing queue and logging out...', refreshError, 'Original URL:', originalRequest.url);
          processQueue(refreshError, null);
          isRefreshing = false;
          
          useAuthStore.getState().logout();
          window.location.href = '/login?reason=session_expired';
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
export default api;
