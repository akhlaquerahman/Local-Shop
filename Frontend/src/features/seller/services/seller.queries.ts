import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerService } from './seller.service';

export const useSellerProducts = (params?: any) => {
  return useQuery({
    queryKey: ['seller-products', params],
    queryFn: () => sellerService.getProducts(params)
  });
};

export const useSellerProduct = (id: string) => {
  return useQuery({
    queryKey: ['seller-product', id],
    queryFn: () => sellerService.getProduct(id),
    enabled: !!id
  });
};

export const useSellerBrands = () => {
  return useQuery({
    queryKey: ['seller-brands'],
    queryFn: () => sellerService.getBrands()
  });
};

export const useSellerProductStats = () => {
  return useQuery({
    queryKey: ['seller-product-stats'],
    queryFn: () => sellerService.getProductStats()
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-product-stats'] });
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => sellerService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-product-stats'] });
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['seller-product', variables.id] });
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellerService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-product-stats'] });
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
    }
  });
};

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { products: any[]; fileName: string }) => sellerService.importProducts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-import-history'] });
      queryClient.invalidateQueries({ queryKey: ['seller-product-stats'] });
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
    }
  });
};

export const useImportHistory = () => {
  return useQuery({
    queryKey: ['seller-import-history'],
    queryFn: () => sellerService.getImportHistory()
  });
};

export const useSellerInventory = () => {
  return useQuery({
    queryKey: ['seller-inventory'],
    queryFn: () => sellerService.getInventory()
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => sellerService.updateInventory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
    }
  });
};

export const useSellerOrders = (params?: any) => {
  return useQuery({
    queryKey: ['seller-orders', params],
    queryFn: () => sellerService.getOrders(params)
  });
};

export const useSellerOrderStats = () => {
  return useQuery({
    queryKey: ['seller-order-stats'],
    queryFn: () => sellerService.getOrderStats()
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, verificationCode }: { id: string; status: string; verificationCode?: string }) => sellerService.updateOrderStatus(id, status, verificationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-order-stats'] });
    }
  });
};

// ========================
// DELIVERY REQUESTS
// ========================
export const useDeliveryRequests = () => {
  return useQuery({
    queryKey: ['seller-delivery-requests'],
    queryFn: () => sellerService.getDeliveryRequests()
  });
};

export const useDeliveryRequestStats = () => {
  return useQuery({
    queryKey: ['seller-delivery-request-stats'],
    queryFn: () => sellerService.getDeliveryRequestStats()
  });
};

export const useUpdateDeliveryRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => sellerService.updateDeliveryRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-delivery-requests'] });
      queryClient.invalidateQueries({ queryKey: ['seller-delivery-request-stats'] });
    }
  });
};

export const useOrderBids = (id: string) => {
  return useQuery({
    queryKey: ['seller-order-bids', id],
    queryFn: () => sellerService.getOrderBids(id),
    enabled: !!id
  });
};

export const useAcceptRiderBid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, riderId }: { id: string, riderId: string }) => sellerService.acceptRiderBid(id, riderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-delivery-requests'] });
      queryClient.invalidateQueries({ queryKey: ['seller-delivery-request-stats'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    }
  });
};

// ========================
// DELIVERY PARTNERS
// ========================
export const useRiders = () => {
  return useQuery({
    queryKey: ['seller-riders'],
    queryFn: () => sellerService.getRiders()
  });
};

export const useRiderStats = () => {
  return useQuery({
    queryKey: ['seller-rider-stats'],
    queryFn: () => sellerService.getRiderStats()
  });
};

// ========================
// CUSTOMERS
// ========================
export const useCustomers = () => {
  return useQuery({
    queryKey: ['seller-customers'],
    queryFn: () => sellerService.getCustomers()
  });
};

export const useCustomerStats = () => {
  return useQuery({
    queryKey: ['seller-customer-stats'],
    queryFn: () => sellerService.getCustomerStats()
  });
};

// ========================
// COUPONS
// ========================
export const useCoupons = () => {
  return useQuery({
    queryKey: ['seller-coupons'],
    queryFn: () => sellerService.getCoupons()
  });
};

export const useCouponStats = () => {
  return useQuery({
    queryKey: ['seller-coupon-stats'],
    queryFn: () => sellerService.getCouponStats()
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['seller-coupon-stats'] });
    }
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => sellerService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['seller-coupon-stats'] });
    }
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellerService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['seller-coupon-stats'] });
    }
  });
};

// ========================
// ANALYTICS & MARKETING
// ========================
export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['seller-analytics-overview'],
    queryFn: () => sellerService.getAnalyticsOverview()
  });
};

export const useRevenueTrend = () => {
  return useQuery({
    queryKey: ['seller-analytics-revenue'],
    queryFn: () => sellerService.getRevenueTrend()
  });
};

export const useOrdersTrend = () => {
  return useQuery({
    queryKey: ['seller-analytics-orders'],
    queryFn: () => sellerService.getOrdersTrend()
  });
};

export const useProductAnalytics = () => {
  return useQuery({
    queryKey: ['seller-analytics-products'],
    queryFn: () => sellerService.getProductAnalytics()
  });
};

export const useCustomerAnalytics = () => {
  return useQuery({
    queryKey: ['seller-analytics-customers'],
    queryFn: () => sellerService.getCustomerAnalytics()
  });
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ['seller-promotions'],
    queryFn: () => sellerService.getPromotions()
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['seller-marketing-overview'] });
    }
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => sellerService.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['seller-marketing-overview'] });
      queryClient.invalidateQueries({ queryKey: ['seller-marketing-activity'] });
    }
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellerService.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['seller-marketing-overview'] });
    }
  });
};

export const useMarketingOverview = () => {
  return useQuery({
    queryKey: ['seller-marketing-overview'],
    queryFn: () => sellerService.getMarketingOverview()
  });
};

export const useMarketingActivity = () => {
  return useQuery({
    queryKey: ['seller-marketing-activity'],
    queryFn: () => sellerService.getMarketingActivity()
  });
};

// ========================
// OPERATIONS & MANAGEMENT
// ========================
export const useRevenueOverview = () => {
  return useQuery({
    queryKey: ['seller-revenue-overview'],
    queryFn: () => sellerService.getRevenueOverview()
  });
};

export const useRevenueChart = () => {
  return useQuery({
    queryKey: ['seller-revenue-chart'],
    queryFn: () => sellerService.getRevenueChart()
  });
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ['seller-transactions'],
    queryFn: () => sellerService.getTransactions()
  });
};

export const usePayouts = () => {
  return useQuery({
    queryKey: ['seller-payouts'],
    queryFn: () => sellerService.getPayouts()
  });
};

export const usePayoutSummary = () => {
  return useQuery({
    queryKey: ['seller-payout-summary'],
    queryFn: () => sellerService.getPayoutSummary()
  });
};

export const useRequestPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.requestPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['seller-payout-summary'] });
    }
  });
};

export const useReviews = (params?: any) => {
  return useQuery({
    queryKey: ['seller-reviews', params],
    queryFn: () => sellerService.getReviews(params)
  });
};

export const useReplyToReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reviewId: string; reply: string }) => sellerService.replyToReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
    }
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['seller-settings'],
    queryFn: () => sellerService.getSettings()
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-settings'] });
    }
  });
};

export const useStaff = () => {
  return useQuery({
    queryKey: ['seller-staff'],
    queryFn: () => sellerService.getStaff()
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-staff'] });
    }
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => sellerService.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-staff'] });
    }
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellerService.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-staff'] });
    }
  });
};

// ========================
// ACCOUNT & COMPLIANCE
// ========================
export const useKyc = () => {
  return useQuery({
    queryKey: ['seller-kyc'],
    queryFn: () => sellerService.getKyc()
  });
};

export const useUploadKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.uploadKyc(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-kyc'] });
    }
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['seller-notifications'],
    queryFn: () => sellerService.getNotifications()
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellerService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-notifications'] });
    }
  });
};

export const useTickets = () => {
  return useQuery({
    queryKey: ['seller-tickets'],
    queryFn: () => sellerService.getTickets()
  });
};

export const useTicketById = (id: string) => {
  return useQuery({
    queryKey: ['seller-ticket', id],
    queryFn: () => sellerService.getTicketById(id),
    enabled: !!id
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-tickets'] });
    }
  });
};

export const useReplyTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => sellerService.replyTicket(id, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller-ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['seller-tickets'] });
    }
  });
};

export const useResolveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellerService.resolveTicket(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['seller-ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['seller-tickets'] });
    }
  });
};

export const useReports = () => {
  return useQuery({
    queryKey: ['seller-reports'],
    queryFn: () => sellerService.getReports()
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.generateReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-reports'] });
    }
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['seller-profile'],
    queryFn: () => sellerService.getProfile()
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
    }
  });
};

export const useShopLocation = () => {
  return useQuery({
    queryKey: ['seller-shop-location'],
    queryFn: () => sellerService.getShopLocation()
  });
};

export const useUpdateShopLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sellerService.updateShopLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-shop-location'] });
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
    }
  });
};

export const useSecurity = () => {
  return useQuery({
    queryKey: ['seller-security'],
    queryFn: () => sellerService.getSecurity()
  });
};

export const useLogoutAllSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sellerService.logoutAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-security'] });
    }
  });
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['seller-audit-logs'],
    queryFn: () => sellerService.getAuditLogs()
  });
};
