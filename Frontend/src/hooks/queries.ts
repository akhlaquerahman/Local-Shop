import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Shop } from '@/domain/shop';
import { Product } from '@/domain/product';
import { Order } from '@/domain/order';

export interface Category {
  id: string;
  _id?: string;
  name: string;
  icon?: string;
  color?: string;
  bg?: string;
  image?: string;
  slug?: string;
  description?: string;
  shopCount?: number;
  productCount?: number;
}

export interface SearchResults {
  products: Product[];
  shops: Shop[];
  categories: Category[];
}

export const useHomeData = () => {
  return useQuery({
    queryKey: ['homeData'],
    queryFn: async () => {
      const [categories, shops, deals, recommended, activeOrder] = await Promise.all([
        api.get('/v1/categories').then(res => res.data.data),
        api.get('/v1/shops/featured').then(res => res.data.data),
        api.get('/v1/products/deals').then(res => res.data.data),
        api.get('/v1/products/recommended').then(res => res.data.data),
        api.get('/v1/orders/active').then(res => res.data.data),
      ]);
      return { categories, shops, deals, recommended, activeOrder };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/v1/categories').then(res => res.data.data),
    staleTime: 1000 * 60 * 10,
  });
};

export const useCategoryDetails = (slug: string) => {
  return useQuery<Category | null>({
    queryKey: ['categories', slug],
    queryFn: () => api.get(`/v1/categories/${slug}`).then(res => res.data.data || null),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCategoryProducts = (slug: string) => {
  return useQuery<Product[]>({
    queryKey: ['categories', slug, 'products'],
    queryFn: () => api.get(`/v1/categories/${slug}/products`).then(res => res.data.data || []),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategoryShops = (slug: string) => {
  return useQuery<Shop[]>({
    queryKey: ['categories', slug, 'shops'],
    queryFn: () => api.get(`/v1/categories/${slug}/shops`).then(res => res.data.data || []),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useShops = (filters?: { category?: string; minRating?: number; openOnly?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.set('category', filters.category);
  if (filters?.minRating) queryParams.set('minRating', filters.minRating.toString());
  if (filters?.openOnly) queryParams.set('openOnly', 'true');

  return useQuery<Shop[]>({
    queryKey: ['shops', filters],
    queryFn: () => api.get(`/v1/shops?${queryParams.toString()}`).then(res => res.data.data || []),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

export const useFeaturedShops = () => {
  return useQuery<Shop[]>({
    queryKey: ['shops', 'featured'],
    queryFn: () => api.get('/v1/shops/featured').then(res => res.data.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products', 'all'],
    queryFn: () => api.get('/v1/products').then(res => res.data.data || []),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFreshDeals = () => {
  return useQuery<Product[]>({
    queryKey: ['products', 'deals'],
    queryFn: () => api.get('/v1/products/deals').then(res => res.data.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeals = () => {
  return useQuery<Product[]>({
    queryKey: ['products', 'deals'],
    queryFn: () => api.get('/v1/products/deals').then(res => res.data.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecommendations = () => {
  return useQuery<Product[]>({
    queryKey: ['products', 'recommended'],
    queryFn: () => api.get('/v1/products/recommended').then(res => res.data.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecommendedProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products', 'recommended'],
    queryFn: () => api.get('/v1/products/recommended').then(res => res.data.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecentlyViewed = () => {
  return useQuery<Product[]>({
    queryKey: ['products', 'recently-viewed'],
    queryFn: () => api.get('/v1/products').then(res => {
      return (res.data.data || []).slice(0, 4);
    }),
    staleTime: 1000 * 60 * 2,
  });
};

export const useActiveOrder = () => {
  return useQuery<Order | null>({
    queryKey: ['orders', 'active'],
    queryFn: () => api.get('/v1/orders/active').then(res => res.data.data || null),
    staleTime: 1000 * 30,
  });
};

export const useProduct = (productId: string) => {
  return useQuery<Product | null>({
    queryKey: ['product', productId],
    queryFn: () => api.get(`/v1/products`).then(res => {
      const list: Product[] = res.data.data || [];
      return list.find(p => p.id === productId || p._id === productId) || null;
    }),
    enabled: !!productId,
  });
};

export const useShop = (shopId: string) => {
  return useQuery<Shop | null>({
    queryKey: ['shop', shopId],
    queryFn: () => api.get(`/v1/shops`).then(res => {
      const list: Shop[] = res.data.data || [];
      return list.find(s => s.id === shopId || s._id === shopId || s.slug === shopId) || null;
    }),
    enabled: !!shopId,
  });
};

export const useShopProducts = (shopId: string) => {
  return useQuery<Product[]>({
    queryKey: ['shopProducts', shopId],
    queryFn: () => api.get(`/v1/products`).then(res => {
      const list: Product[] = res.data.data || [];
      return list.filter(p => {
        const pShopId = typeof p.shopId === 'object' && p.shopId !== null
          ? (p.shopId as any)._id || (p.shopId as any).id
          : p.shopId;
        return String(pShopId) === String(shopId);
      });
    }),
    enabled: !!shopId,
  });
};

// ─── SEARCH EXPERIENCE HOOKS ───────────────────────────────────────────────

export const useSearch = (query: string) => {
  return useQuery<SearchResults>({
    queryKey: ['search', query],
    queryFn: () => api.get(`/v1/search?q=${encodeURIComponent(query)}`).then(res => res.data.data || { products: [], shops: [], categories: [] }),
    enabled: !!query,
    staleTime: 1000 * 60 * 3, // 3 minutes cache for search results
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery<SearchResults>({
    queryKey: ['search', 'suggestions', query],
    queryFn: () => api.get(`/v1/search/suggestions?q=${encodeURIComponent(query)}`).then(res => res.data.data || { products: [], shops: [], categories: [] }),
    enabled: !!query,
    staleTime: 1000 * 30, // 30 seconds cache for rapid typing
  });
};

export const useRecentSearches = () => {
  return useQuery<string[]>({
    queryKey: ['search', 'recent'],
    queryFn: () => api.get('/v1/search/recent').then(res => res.data.data || []),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useTrendingSearches = () => {
  return useQuery<string[]>({
    queryKey: ['search', 'trending'],
    queryFn: () => api.get('/v1/search/trending').then(res => res.data.data || []),
    staleTime: 1000 * 60 * 30, // 30 minutes cache for trending searches
  });
};

export const useAddRecentSearch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (term: string) => api.post('/v1/search/recent', { term }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });
    }
  });
};

export const useDeleteRecentSearch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (term: string) => api.delete(`/v1/search/recent?term=${encodeURIComponent(term)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });
    }
  });
};

// ─── ADMIN NOTIFICATIONS ────────────────────────────────────────────────────────

export const useAdminNotifications = () => {
  return useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => api.get('/v1/admin/notifications').then(res => res.data.data),
    refetchInterval: 30000, // refresh every 30s
  });
};

// ─── RETURNS ──────────────────────────────────────────────────────────────────

export const useReturns = () => {
  return useQuery({
    queryKey: ['returns'],
    queryFn: () => api.get('/v1/returns/my').then(res => res.data.data),
  });
};

export const useCreateReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/v1/returns', data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    }
  });
};

// ─── CART AND WISHLIST REACT QUERY HOOKS ────────────────────────────────────

export const useWishlist = () => {
  return useQuery<Product[]>({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/v1/wishlist').then(res => res.data.data || []),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useAddWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => api.post('/v1/wishlist', { productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });
};

export const useRemoveWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => api.delete(`/v1/wishlist?productId=${encodeURIComponent(productId)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/v1/wishlist/clear'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });
};

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CartData {
  userId: string;
  shopId: string | null;
  shopName: string | null;
  items: CartItem[];
}

export const useCart = () => {
  return useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: () => api.get('/v1/cart').then(res => res.data.data || { items: [], shopId: null, shopName: null }),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

export const useAddCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { shopId: string; shopName: string; item: CartItem }) => 
      api.post('/v1/cart', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useUpdateCartQty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { productId: string; quantity: number }) => 
      api.put('/v1/cart/quantity', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => 
      api.delete(`/v1/cart/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/v1/cart/clear'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useCartSummary = () => {
  const { data: cartData } = useCart();
  const items = cartData?.items || [];
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% standard GST
  const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 40) : 0; // Free delivery above 500
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
  
  return { subtotal, tax, deliveryFee, total };
};

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: (payload: { code: string; subtotal: number }) => 
      api.post('/v1/cart/apply-coupon', payload).then(res => res.data.data)
  });
};

export const useOrders = (filters?: { search?: string; tab?: string }) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.tab && filters.tab !== 'all') params.append('status', filters.tab);
  
  return useQuery<Order[]>({
    queryKey: ['orders', filters],
    queryFn: () => api.get(`/v1/orders?${params.toString()}`).then(res => res.data.data || []),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useOrderDetails = (orderId: string, options?: { refetchInterval?: number }) => {
  return useQuery<Order | null>({
    queryKey: ['orders', orderId],
    queryFn: () => api.get(`/v1/orders/${orderId}`).then(res => res.data.data || null),
    enabled: !!orderId,
    ...options,
  });
};

export interface OrderStats {
  all: number;
  active: number;
  delivered: number;
  cancelled: number;
  refunded: number;
}

export const useOrderStats = () => {
  return useQuery<OrderStats>({
    queryKey: ['orders', 'stats'],
    queryFn: () => api.get('/v1/orders/stats').then(res => res.data.data || { all: 0, active: 0, delivered: 0, cancelled: 0, refunded: 0 }),
    staleTime: 1000 * 30,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      shopId: string;
      shopName: string;
      subtotal: number;
      tax: number;
      deliveryFee: number;
      discount: number;
      total: number;
      items: any[];
      deliveryAddress: string;
    }) => api.post('/v1/orders', payload).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};


export const useVerifyDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, code }: { orderId: string; code: string }) => 
      api.post(`/v1/orders/${orderId}/verify-delivery`, { code }).then(res => res.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', data._id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['activeOrder'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    },
  });
};

// ==========================================
// REWARDS MODULE (Wallet, Coupons, Referrals)
// ==========================================

export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get('/v1/wallet').then(res => res.data.data),
  });
};

export const useWalletStats = () => {
  return useQuery({
    queryKey: ['wallet-stats'],
    queryFn: () => api.get('/v1/wallet/stats').then(res => res.data.data),
  });
};

export const useTransactions = (type: 'all' | 'credit' | 'debit' | 'refund' = 'all') => {
  return useQuery({
    queryKey: ['transactions', type],
    queryFn: () => api.get(`/v1/wallet/transactions?type=${type}`).then(res => res.data.data),
  });
};

export const useTopupWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => api.post('/v1/wallet/topup', { amount }).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useCoupons = (filter: 'available' | 'used' | 'expired' = 'available') => {
  return useQuery({
    queryKey: ['coupons', filter],
    queryFn: () => {
      if (filter === 'available') return api.get('/v1/coupons/available').then(res => res.data.data || []);
      if (filter === 'used') return api.get('/v1/coupons/used').then(res => res.data.data || []);
      return api.get('/v1/coupons/expired').then(res => res.data.data || []);
    },
  });
};

export const useCouponStats = () => {
  return useQuery({
    queryKey: ['coupon-stats'],
    queryFn: async () => {
      const [available, used, expired] = await Promise.all([
        api.get('/v1/coupons/available').then(res => res.data.data || []),
        api.get('/v1/coupons/used').then(res => res.data.data || []),
        api.get('/v1/coupons/expired').then(res => res.data.data || [])
      ]);
      return { available: available.length, used: used.length, expired: expired.length };
    },
  });
};

export const useReferrals = () => {
  return useQuery({
    queryKey: ['referrals'],
    queryFn: () => api.get('/v1/referrals').then(res => res.data.data || []),
  });
};

export const useReferralStats = () => {
  return useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => api.get('/v1/referrals/stats').then(res => res.data.data),
  });
};

// ==========================================
// ACCOUNT MODULE (Profile, Addresses, etc.)
// ==========================================

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/v1/profile/me').then(res => res.data.data),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch('/v1/profile/me', data).then(res => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
};

export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/v1/addresses').then(res => res.data.data),
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/v1/addresses', data).then(res => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/addresses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/v1/addresses/${id}`, data).then(res => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/v1/addresses/${id}/default`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};



export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get('/v1/payments').then(res => res.data.data),
  });
};

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/v1/payments', data).then(res => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/payments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/v1/payments/${id}/default`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  });
};

export const useSecuritySessions = () => {
  return useQuery({
    queryKey: ['security-sessions'],
    queryFn: () => api.get('/v1/security/sessions').then(res => res.data.data),
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/security/sessions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['security-sessions'] }),
  });
};

export const useDeleteAllSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/v1/security/sessions'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['security-sessions'] }),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: any) => api.post('/v1/security/change-password', data),
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: (data: { code: string; subtotal: number; shopId?: string }) => api.post('/v1/coupons/validate', data).then(res => res.data.data),
  });
};

export const useActivityLogs = (category: string = 'All') => {
  return useQuery({
    queryKey: ['activity-logs', category],
    queryFn: () => api.get(`/v1/activity?category=${category}`).then(res => res.data.data),
  });
};

// ==========================================
// SYSTEM & SUPPORT MODULE
// ==========================================

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/v1/notifications').then(res => res.data.data),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) => id ? api.patch(`/v1/notifications/${id}/read`) : api.patch('/v1/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useClearNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/v1/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useSupportTickets = () => {
  return useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => api.get('/v1/support').then(res => res.data.data),
  });
};

export const useSupportTicket = (id: string) => {
  return useQuery({
    queryKey: ['support-tickets', id],
    queryFn: () => api.get(`/v1/support/${id}`).then(res => res.data.data),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/v1/support', data).then(res => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
  });
};

export const useReplyTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => api.post(`/v1/support/${id}/reply`, { message }).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets', variables.id] });
    },
  });
};

export const useResolveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/v1/support/${id}/resolve`).then(res => res.data.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets', id] });
    },
  });
};

export const useCustomerSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/v1/settings').then(res => res.data.data),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch('/v1/settings', data).then(res => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });
};

// --- REVIEWS ---

export const useProductReviews = (productId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['product-reviews', productId, page, limit],
    queryFn: () => api.get(`/v1/reviews/product/${productId}?page=${page}&limit=${limit}`).then(res => res.data),
    enabled: !!productId,
  });
};

export const useShopReviews = (shopId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['reviews', 'shop', shopId, page, limit],
    queryFn: () => api.get(`/v1/reviews/shop/${shopId}?page=${page}&limit=${limit}`).then(res => res.data),
    enabled: !!shopId,
  });
};

export const useSubmitProductReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; orderId: string; rating: number; title: string; comment: string; images: string[] }) => 
      api.post('/v1/reviews/product', data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', variables.productId] });
    }
  });
};

export const useSubmitShopReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { shopId: string; orderId: string; rating: number; title: string; comment: string; images: string[] }) => 
      api.post('/v1/reviews/shop', data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'shop', variables.shopId] });
    }
  });
};

export const useCustomerReviews = (filter = 'All', search = '') => {
  return useQuery({
    queryKey: ['customer-reviews', filter, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filter && filter !== 'All') params.set('filter', filter);
      if (search) params.set('search', search);
      return api.get(`/v1/reviews/customer?${params.toString()}`).then(res => res.data);
    },
  });
};

export const useCreateProductReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/v1/reviews/product', data).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
    },
  });
};

export const useCreateShopReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/v1/reviews/shop', data).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shop-reviews', variables.shopId] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/v1/reviews/${id}`, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['shop-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/reviews/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['shop-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
    },
  });
};

