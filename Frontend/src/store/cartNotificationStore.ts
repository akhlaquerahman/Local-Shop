import { create } from 'zustand';

interface CartNotification {
  productName: string;
  quantity: number;
  cartTotal: number;
  visible: boolean;
}

interface CartNotificationState {
  notification: CartNotification | null;
  showNotification: (productName: string, quantity: number, cartTotal: number) => void;
  hideNotification: () => void;
}

export const useCartNotificationStore = create<CartNotificationState>((set) => ({
  notification: null,
  showNotification: (productName, quantity, cartTotal) => set({
    notification: { productName, quantity, cartTotal, visible: true }
  }),
  hideNotification: () => set((state) => ({
    notification: state.notification ? { ...state.notification, visible: false } : null
  })),
}));
