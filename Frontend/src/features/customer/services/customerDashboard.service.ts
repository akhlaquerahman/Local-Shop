import api from '@/lib/axios';
import { Product } from '@/domain/product';
import { Shop } from '@/domain/shop';
import { Order } from '@/domain/order';

export const customerDashboardService = {
  fetchCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  fetchNearbyShops: async (): Promise<Shop[]> => {
    const response = await api.get('/shops');
    return response.data;
  },

  fetchFreshDeals: async (): Promise<Product[]> => {
    const response = await api.get('/products/deals');
    return response.data;
  },

  fetchRecommended: async (): Promise<Product[]> => {
    const response = await api.get('/products/recommended');
    return response.data;
  },

  fetchRecentlyViewed: async (): Promise<Product[]> => {
    const response = await api.get('/products/recently-viewed');
    return response.data;
  },

  fetchActiveOrder: async (): Promise<Order | null> => {
    const response = await api.get('/orders/active');
    return response.data;
  }
};
