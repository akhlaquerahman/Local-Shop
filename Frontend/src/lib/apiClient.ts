import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post('http://localhost:5000/api/auth/refresh-token', { refreshToken });
          if (data.success && data.token) {
            useAuthStore.getState().login({
              user: useAuthStore.getState().user!,
              token: data.token,
              refreshToken: data.refreshToken,
            });
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          useAuthStore.getState().logout();
          window.location.href = '/login?reason=session_expired';
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login?reason=session_expired';
      }
    }
    
    // Attach backend error message directly to the error object so it's easier to access
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
