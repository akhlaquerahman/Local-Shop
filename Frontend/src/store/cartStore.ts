import { create } from 'zustand';
import { OrderItem } from '@/domain/order';

interface CartState {
  shopId: string | null;
  shopName: string | null;
  items: OrderItem[];
  addItem: (shopId: string, shopName: string, item: OrderItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  shopId: null,
  shopName: null,
  items: [],
  
  addItem: (shopId, shopName, item) => set((state) => {
    // Hyperlocal restriction: Cart items must belong to the same merchant shop.
    if (state.shopId && state.shopId !== shopId) {
      // Clear previous shop cart and initialize with new shop's item
      return { shopId, shopName, items: [item] };
    }
    
    const existingIndex = state.items.findIndex((i) => i.productId === item.productId);
    if (existingIndex > -1) {
      const nextItems = [...state.items];
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        quantity: nextItems[existingIndex].quantity + item.quantity,
      };
      return { shopId, shopName, items: nextItems };
    }
    
    return { shopId, shopName, items: [...state.items, item] };
  }),
  
  removeItem: (productId) => set((state) => {
    const nextItems = state.items.filter((i) => i.productId !== productId);
    if (nextItems.length === 0) {
      return { shopId: null, shopName: null, items: [] };
    }
    return { items: nextItems };
  }),
  
  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      const nextItems = state.items.filter((i) => i.productId !== productId);
      if (nextItems.length === 0) {
        return { shopId: null, shopName: null, items: [] };
      }
      return { items: nextItems };
    }
    const nextItems = state.items.map((i) => 
      i.productId === productId ? { ...i, quantity } : i
    );
    return { items: nextItems };
  }),
  
  clearCart: () => set({ shopId: null, shopName: null, items: [] }),
  
  getCartTotal: () => {
    const items = get().items;
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% standard GST
    const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 40) : 0; // Free delivery above 500
    const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
    
    return { subtotal, tax, deliveryFee, total };
  },
}));
