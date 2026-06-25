import { create } from 'zustand';
import { Notification } from '@/domain/notification';
import { api } from '@/lib/axios';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  toasts: ToastMessage[];
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
  markAsReadAsync: (id: string) => Promise<void>;
  markAllAsReadAsync: () => Promise<void>;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  toasts: [],
  
  addNotification: (n) => set((state) => {
    const newNotif: Notification = {
      ...n,
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    return { notifications: [newNotif, ...state.notifications] };
  }),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n)
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
  })),

  fetchNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data && response.data.data) {
        // Map backend _id to id if necessary
        const fetchedNotifs = response.data.data.map((n: any) => ({
          ...n,
          id: n._id || n.id,
        }));
        set({ notifications: fetchedNotifs });
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  },

  markAsReadAsync: async (id: string) => {
    try {
      set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n)
      }));
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },

  markAllAsReadAsync: async () => {
    try {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
      }));
      await api.patch('/notifications/read');
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  },
  
  addToast: (t) => set((state) => {
    const id = `toast-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { ...t, id };
    
    // Auto-remove toast
    const duration = t.duration ?? 4000;
    setTimeout(() => {
      set((currentState) => ({
        toasts: currentState.toasts.filter((item) => item.id !== id)
      }));
    }, duration);
    
    return { toasts: [...state.toasts, newToast] };
  }),
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  
  clearAll: () => set({ notifications: [], toasts: [] }),
}));
