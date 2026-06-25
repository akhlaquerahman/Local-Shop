import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BuyNowItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface BuyNowSession {
  shopId: string;
  shopName: string;
  item: BuyNowItem;
}

export interface BuyNowStore {
  session: BuyNowSession | null;
  setSession: (session: BuyNowSession) => void;
  clearSession: () => void;
}

export const useBuyNowStore = create<BuyNowStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'localshop-buy-now',
    }
  )
);
