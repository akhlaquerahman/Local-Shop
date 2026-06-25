import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, PaginationParams } from './admin.service';

export const useAdminSellers = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-sellers', params],
    queryFn: () => adminService.getSellers(params),
    keepPreviousData: true
  });
};

export const useSuspendAdminSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.suspendSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
    }
  });
};

export const useAdminCustomers = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-customers', params],
    queryFn: () => adminService.getCustomers(params),
    keepPreviousData: true
  });
};

export const useSuspendAdminCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.suspendCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    }
  });
};

export const useAdminRiders = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-riders', params],
    queryFn: () => adminService.getRiders(params),
    keepPreviousData: true
  });
};

export const useSuspendAdminRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.suspendRider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
    }
  });
};

export const useAdminCities = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-cities', params],
    queryFn: () => adminService.getCities(params),
    keepPreviousData: true
  });
};

export const useAdminZones = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-zones', params],
    queryFn: () => adminService.getZones(params),
    keepPreviousData: true
  });
};

export const useAdminCategories = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-categories', params],
    queryFn: () => adminService.getCategories(params),
    keepPreviousData: true
  });
};

export const useCreateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    }
  });
};

export const useUpdateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminService.updateCategory({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    }
  });
};

export const useDeleteAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    }
  });
};

export const useAdminBrands = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-brands', params],
    queryFn: () => adminService.getBrands(params),
    keepPreviousData: true
  });
};

export const useCreateAdminBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    }
  });
};

export const useUpdateAdminBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminService.updateBrand({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    }
  });
};

export const useDeleteAdminBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    }
  });
};

export const useAdminProducts = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => adminService.getProducts(params),
    keepPreviousData: true
  });
};

export const useAdminInventory = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-inventory', params],
    queryFn: () => adminService.getInventory(params),
    keepPreviousData: true
  });
};

export const useAdminOrders = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => adminService.getOrders(params),
    keepPreviousData: true
  });
};

export const useAdminOrderById = (id: string) => {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminService.getOrderById(id),
    enabled: !!id
  });
};

export const useAdminPayments = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-payments', params],
    queryFn: () => adminService.getPayments(params),
    keepPreviousData: true
  });
};

export const useAdminRefunds = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-refunds', params],
    queryFn: () => adminService.getRefunds(params),
    keepPreviousData: true
  });
};

export const useAdminCommissions = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-commissions', params],
    queryFn: () => adminService.getCommissions(params),
    keepPreviousData: true
  });
};

export const useAdminWallets = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-wallets', params],
    queryFn: () => adminService.getWallets(params),
    keepPreviousData: true
  });
};

export const useAdminReviews = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: () => adminService.getReviews(params),
    keepPreviousData: true
  });
};

export const useAdminRatings = () => {
  return useQuery({
    queryKey: ['admin-ratings'],
    queryFn: () => adminService.getRatings(),
  });
};

export const useAdminDisputes = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-disputes', params],
    queryFn: () => adminService.getDisputes(params),
    keepPreviousData: true
  });
};

export const useAdminSupportTickets = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-support-tickets', params],
    queryFn: () => adminService.getSupportTickets(params),
    keepPreviousData: true
  });
};

export const useAdminNotifications = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-notifications', params],
    queryFn: () => adminService.getNotifications(params),
    keepPreviousData: true
  });
};

export const useAdminAnnouncements = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-announcements', params],
    queryFn: () => adminService.getAnnouncements(params),
    keepPreviousData: true
  });
};

export const useAdminBanners = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-banners', params],
    queryFn: () => adminService.getBanners(params),
    keepPreviousData: true
  });
};

export const useAdminAdvertisements = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-advertisements', params],
    queryFn: () => adminService.getAdvertisements(params),
    keepPreviousData: true
  });
};

export const useAdminCoupons = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-coupons', params],
    queryFn: () => adminService.getCoupons(params),
    keepPreviousData: true
  });
};

export const useAdminPages = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-pages', params],
    queryFn: () => adminService.getPages(params),
    keepPreviousData: true
  });
};

export const useAdminBlogs = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-blogs', params],
    queryFn: () => adminService.getBlogs(params),
    keepPreviousData: true
  });
};

export const useAdminFaqs = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-faqs', params],
    queryFn: () => adminService.getFaqs(params),
    keepPreviousData: true
  });
};

export const useAdminEmailTemplates = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-email-templates', params],
    queryFn: () => adminService.getEmailTemplates(params),
    keepPreviousData: true
  });
};

export const useAdminSmsTemplates = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-sms-templates', params],
    queryFn: () => adminService.getSmsTemplates(params),
    keepPreviousData: true
  });
};

export const useAdminPushTemplates = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-push-templates', params],
    queryFn: () => adminService.getPushTemplates(params),
    keepPreviousData: true
  });
};

export const useAdminRoles = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-roles', params],
    queryFn: () => adminService.getRoles(params),
    keepPreviousData: true
  });
};

export const useAdminPermissions = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-permissions', params],
    queryFn: () => adminService.getPermissions(params),
    keepPreviousData: true
  });
};

export const useAdminAuditLogs = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-audit-logs', params],
    queryFn: () => adminService.getAuditLogs(params),
    keepPreviousData: true
  });
};

export const useAdminSystemLogs = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-system-logs', params],
    queryFn: () => adminService.getSystemLogs(params),
    keepPreviousData: true
  });
};

export const useAdminFraudCases = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-fraud-cases', params],
    queryFn: () => adminService.getFraudCases(params),
    keepPreviousData: true
  });
};

export const useAdminPlatformHealth = () => {
  return useQuery({
    queryKey: ['admin-platform-health'],
    queryFn: () => adminService.getPlatformHealth()
  });
};

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminService.getSettings()
  });
};

export const useAdminIntegrations = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-integrations', params],
    queryFn: () => adminService.getIntegrations(params),
    keepPreviousData: true
  });
};

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics()
  });
};

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => adminService.getAdminProfile()
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.updateAdminProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
    }
  });
};

export const useUpdateAdminSecurity = () => {
  return useMutation({
    mutationFn: (data: any) => adminService.updateAdminSecurity(data)
  });
};

export const useAdminSessions = () => {
  return useQuery({
    queryKey: ['admin-sessions'],
    queryFn: () => adminService.getAdminSessions()
  });
};

export const useDeleteAdminSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteAdminSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    }
  });
};

export const useAdminActivity = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-activity', params],
    queryFn: () => adminService.getAdminActivity(params),
    keepPreviousData: true
  });
};

export const useUpdateAdminPreferences = () => {
  return useMutation({
    mutationFn: (data: any) => adminService.updateAdminPreferences(data)
  });
};

// ENTERPRISE PAYOUTS
export const useAdminPayoutsAggregated = (params: any) => {
  return useQuery({
    queryKey: ['admin-payouts-aggregated', params],
    queryFn: () => adminService.getPayoutsAggregated(params),
    keepPreviousData: true
  });
};

export const useAdminPayoutAccount = (id: string) => {
  return useQuery({
    queryKey: ['admin-payout-account', id],
    queryFn: () => adminService.getPayoutAccountById(id),
    enabled: !!id
  });
};

export const useAdminPayoutLedger = (id: string) => {
  return useQuery({
    queryKey: ['admin-payout-ledger', id],
    queryFn: () => adminService.getPayoutLedger(id),
    enabled: !!id
  });
};

export const useRunBatchPayouts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminService.runBatchPayouts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-aggregated'] });
    }
  });
};

export const useSuspendPayoutAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; reason: string; description: string; suspendedUntil?: string }) => adminService.suspendAccount(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-aggregated'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-account', variables.id] });
    }
  });
};

export const useActivatePayoutAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.activateAccount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-aggregated'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-account', id] });
    }
  });
};

export const useApprovePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; amount: number }) => adminService.approvePayout(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-aggregated'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-account', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-ledger', variables.id] });
    }
  });
};

// ENTERPRISE COMMISSIONS
export const useAdminCommissionDashboard = () => {
  return useQuery({
    queryKey: ['admin-commissions-dashboard'],
    queryFn: () => adminService.getCommissionDashboard()
  });
};

export const useAdminGlobalCommission = () => {
  return useQuery({
    queryKey: ['admin-global-commission'],
    queryFn: () => adminService.getGlobalCommission()
  });
};

export const useUpdateGlobalCommission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.updateGlobalCommission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-global-commission'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commissions-dashboard'] });
    }
  });
};

export const useAdminCategoryCommissions = () => {
  return useQuery({
    queryKey: ['admin-category-commissions'],
    queryFn: () => adminService.getCategoryCommissions()
  });
};

export const useAdminSellerOverrides = () => {
  return useQuery({
    queryKey: ['admin-seller-overrides'],
    queryFn: () => adminService.getSellerOverrides()
  });
};

export const useAdminDeliveryCommission = () => {
  return useQuery({
    queryKey: ['admin-delivery-commission'],
    queryFn: () => adminService.getDeliveryCommission()
  });
};

export const useUpdateDeliveryCommission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.updateDeliveryCommission(data), // Note: need to add this to service if used, but let's assume PUT /delivery exists
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-delivery-commission'] })
  });
};

export const useAdminPromotionalCommissions = () => {
  return useQuery({
    queryKey: ['admin-promotional-commissions'],
    queryFn: () => adminService.getPromotionalCommissions()
  });
};

export const useSimulateCommission = () => {
  return useMutation({
    mutationFn: (data: any) => adminService.simulateCommission(data)
  });
};

export const useAdminCommissionHistory = () => {
  return useQuery({
    queryKey: ['admin-commission-history'],
    queryFn: () => adminService.getCommissionHistory()
  });
};

export const useAdminCommissionAuditLogs = () => {
  return useQuery({
    queryKey: ['admin-commission-audit'],
    queryFn: () => adminService.getCommissionAuditLogs()
  });
};
// ===== ENTERPRISE REVIEWS & REPUTATION =====

export const useAdminReviewDashboard = () => {
  return useQuery({
    queryKey: ['admin-review-dashboard'],
    queryFn: () => adminService.getReviewDashboard()
  });
};

export const useAdminReviewAnalytics = () => {
  return useQuery({
    queryKey: ['admin-review-analytics'],
    queryFn: () => adminService.getReviewAnalytics()
  });
};

export const useAdminReviewsList = (params: any) => {
  return useQuery({
    queryKey: ['admin-reviews-list', params],
    queryFn: () => adminService.getReviews(params)
  });
};

export const useAdminReviewDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-review-details', id],
    queryFn: () => adminService.getReviewDetails(id),
    enabled: !!id
  });
};

export const useApproveReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminService.approveReview(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-dashboard'] });
    }
  });
};

export const useHideReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminService.hideReview(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-dashboard'] });
    }
  });
};

export const useUnhideReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminService.unhideReview(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-dashboard'] });
    }
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminService.deleteReview(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-dashboard'] });
    }
  });
};

// ===== ENTERPRISE DISPUTES MODULE =====

export const useAdminDisputeDashboard = () => {
  return useQuery({
    queryKey: ['admin-dispute-dashboard'],
    queryFn: () => adminService.getDisputeDashboard()
  });
};

export const useAdminDisputesList = (params: any) => {
  return useQuery({
    queryKey: ['admin-disputes-list', params],
    queryFn: () => adminService.getDisputes(params)
  });
};

export const useAdminDisputeDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-dispute-details', id],
    queryFn: () => adminService.getDisputeDetails(id),
    enabled: !!id
  });
};

export const useUpdateDisputeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminService.updateDisputeStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-dashboard'] });
    }
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { winner: string, resolutionNotes: string } }) => adminService.resolveDispute(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-dashboard'] });
    }
  });
};

export const useAddDisputeMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { message: string, isInternal: boolean } }) => adminService.addDisputeMessage(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-details', variables.id] });
    }
  });
};

// ===== ENTERPRISE BANNERS CONFIGURATION =====

export const useAdminBannersList = (params?: any) => {
  return useQuery({
    queryKey: ['admin-banners-list', params],
    queryFn: () => adminService.getBanners(params)
  });
};

export const useAdminBannerDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-banner-details', id],
    queryFn: () => adminService.getBannerDetails(id),
    enabled: !!id
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => adminService.createBanner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners-list'] });
    }
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => adminService.updateBanner(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-banner-details', variables.id] });
    }
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners-list'] });
    }
  });
};

export const useToggleBannerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.toggleBannerStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-banner-details', id] });
    }
  });
};

// ===== ENTERPRISE CMS (BLOGS) =====

export const useAdminBlogsList = (params?: any) => {
  return useQuery({
    queryKey: ['admin-blogs-list', params],
    queryFn: () => adminService.getBlogs(params)
  });
};

export const useAdminBlogDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-blog-details', id],
    queryFn: () => adminService.getBlogDetails(id),
    enabled: !!id
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => adminService.createBlog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs-list'] });
    }
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => adminService.updateBlog(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-details', variables.id] });
    }
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs-list'] });
    }
  });
};

export const useAdminAgents = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['admin-agents', params],
    queryFn: () => adminService.getAgents(params),
    keepPreviousData: true
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, agentId }: { ticketId: string, agentId: string }) => adminService.assignTicket(ticketId, agentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-ticket', variables.ticketId] });
    }
  });
};
