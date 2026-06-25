import apiClient from '@/lib/apiClient';

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export const adminService = {
  getSellers: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/sellers', { params });
    return res.data;
  },

  suspendSeller: async (id: string) => {
    const res = await apiClient.put(`/admin/sellers/${id}/suspend`, {});
    return res.data;
  },
  
  getCustomers: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/customers', { params });
    return res.data;
  },

  suspendCustomer: async (id: string) => {
    const res = await apiClient.put(`/admin/customers/${id}/suspend`, {});
    return res.data;
  },
  
  getRiders: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/riders', { params });
    return res.data;
  },

  suspendRider: async (id: string) => {
    const res = await apiClient.put(`/admin/riders/${id}/suspend`, {});
    return res.data;
  },

  getUserDetails: async (id: string) => {
    const res = await apiClient.get(`/admin/users/${id}`);
    return res.data;
  },

  updateUserKyc: async (id: string, status: string) => {
    const res = await apiClient.put(`/admin/users/${id}/kyc`, { status });
    return res.data;
  },
  
  getCities: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/cities', { params });
    return res.data;
  },

  getZones: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/zones', { params });
    return res.data;
  },

  getCategories: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/categories', { params });
    return res.data;
  },

  createCategory: async (data: any) => {
    const res = await apiClient.post('/admin/categories', data);
    return res.data;
  },

  updateCategory: async ({ id, data }: { id: string, data: any }) => {
    const res = await apiClient.put(`/admin/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await apiClient.delete(`/admin/categories/${id}`);
    return res.data;
  },

  getBrands: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/brands', { params });
    return res.data;
  },

  createBrand: async (data: any) => {
    const res = await apiClient.post('/admin/brands', data);
    return res.data;
  },

  updateBrand: async ({ id, data }: { id: string, data: any }) => {
    const res = await apiClient.put(`/admin/brands/${id}`, data);
    return res.data;
  },

  deleteBrand: async (id: string) => {
    const res = await apiClient.delete(`/admin/brands/${id}`);
    return res.data;
  },

  getProducts: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/products', { params });
    return res.data;
  },

  getInventory: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/inventory', { params });
    return res.data;
  },

  getOrders: async (params?: PaginationParams) => {
    const { data } = await apiClient.get('/admin/orders', { params });
    return data;
  },

  getOrderById: async (id: string) => {
    const { data } = await apiClient.get(`/admin/orders/${id}`);
    return data.data;
  },

  getPayments: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/payments', { params });
    return res.data;
  },

  getPaymentById: async (id: string) => {
    const res = await apiClient.get(`/admin/payments/${id}`);
    return res.data;
  },

  getRefunds: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/refunds', { params });
    return res.data;
  },

  getCommissions: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/commissions', { params });
    return res.data;
  },

  getWallets: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/wallets', { params });
    return res.data;
  },

  getReviews: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/reviews', { params });
    return res.data;
  },

  getRatings: async () => {
    const res = await apiClient.get('/admin/ratings');
    return res.data;
  },

  getDisputes: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/disputes', { params });
    return res.data;
  },

  getSupportTickets: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/support-tickets', { params });
    return res.data;
  },

  getNotifications: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/notifications', { params });
    return res.data;
  },

  getAnnouncements: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/announcements', { params });
    return res.data;
  },

  getBanners: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/banners', { params });
    return res.data;
  },

  getAdvertisements: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/advertisements', { params });
    return res.data;
  },

  getCoupons: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/coupons', { params });
    return res.data;
  },

  getPages: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/pages', { params });
    return res.data;
  },

  getBlogs: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/blogs', { params });
    return res.data;
  },

  getFaqs: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/faqs', { params });
    return res.data;
  },

  getEmailTemplates: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/templates/email', { params });
    return res.data;
  },

  getSmsTemplates: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/templates/sms', { params });
    return res.data;
  },

  getPushTemplates: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/templates/push', { params });
    return res.data;
  },

  getRoles: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/roles', { params });
    return res.data;
  },

  getPermissions: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/permissions', { params });
    return res.data;
  },

  getAuditLogs: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data;
  },

  getSystemLogs: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/system-logs', { params });
    return res.data;
  },

  getFraudCases: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/fraud-cases', { params });
    return res.data;
  },

  getPlatformHealth: async () => {
    const res = await apiClient.get('/admin/platform-health');
    return res.data;
  },

  getSettings: async () => {
    const res = await apiClient.get('/admin/settings');
    return res.data;
  },

  getIntegrations: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/integrations', { params });
    return res.data;
  },

  generateReport: async (data: { reportType: string; format: string }) => {
    const res = await apiClient.post('/admin/reports/generate', data);
    return res.data;
  },

  getAdminProfile: async () => {
    const res = await apiClient.get('/admin/profile');
    return res.data;
  },

  updateAdminProfile: async (data: any) => {
    const res = await apiClient.put('/admin/profile', data);
    return res.data;
  },

  updateAdminSecurity: async (data: any) => {
    const res = await apiClient.put('/admin/security', data);
    return res.data;
  },

  getAdminSessions: async () => {
    const res = await apiClient.get('/admin/sessions');
    return res.data;
  },

  deleteAdminSession: async (sessionId: string) => {
    const res = await apiClient.delete(`/admin/sessions/${sessionId}`);
    return res.data;
  },

  getAdminActivity: async (params: PaginationParams) => {
    const res = await apiClient.get('/admin/profile/activity', { params });
    return res.data;
  },

  updateAdminPreferences: async (data: any) => {
    const res = await apiClient.put('/admin/preferences', data);
    return res.data;
  },

  getAnalytics: async () => {
    const res = await apiClient.get('/admin/analytics');
    return res.data;
  },

  // ENTERPRISE PAYOUTS
  getPayoutsAggregated: async (params: any) => {
    const res = await apiClient.get('/admin/payouts', { params });
    return res.data;
  },
  getPayoutAccountById: async (id: string) => {
    const res = await apiClient.get(`/admin/payouts/${id}`);
    return res.data;
  },
  getPayoutLedger: async (id: string) => {
    const res = await apiClient.get(`/admin/payouts/ledger/${id}`);
    return res.data;
  },
  runBatchPayouts: async () => {
    const res = await apiClient.post('/admin/payouts/run-batch');
    return res.data;
  },
  suspendAccount: async (data: { id: string; reason: string; description: string; suspendedUntil?: string }) => {
    const res = await apiClient.post(`/admin/payouts/suspend/${data.id}`, data);
    return res.data;
  },
  activateAccount: async (id: string) => {
    const res = await apiClient.post(`/admin/payouts/activate/${id}`);
    return res.data;
  },
  approvePayout: async (data: { id: string; amount: number }) => {
    const res = await apiClient.post('/admin/payouts/approve', data);
    return res.data;
  },

  // ENTERPRISE COMMISSIONS
  getCommissionDashboard: async () => {
    const res = await apiClient.get('/admin/commissions/dashboard');
    return res.data;
  },
  getGlobalCommission: async () => {
    const res = await apiClient.get('/admin/commissions/global');
    return res.data;
  },
  updateGlobalCommission: async (data: any) => {
    const res = await apiClient.put('/admin/commissions/global', data);
    return res.data;
  },
  getCategoryCommissions: async () => {
    const res = await apiClient.get('/admin/commissions/categories');
    return res.data;
  },
  getSellerOverrides: async () => {
    const res = await apiClient.get('/admin/commissions/sellers');
    return res.data;
  },
  getDeliveryCommission: async () => {
    const res = await apiClient.get('/admin/commissions/delivery');
    return res.data;
  },
  getPromotionalCommissions: async () => {
    const res = await apiClient.get('/admin/commissions/promotions');
    return res.data;
  },
  simulateCommission: async (data: any) => {
    const res = await apiClient.post('/admin/commissions/simulator', data);
    return res.data;
  },
  getCommissionHistory: async () => {
    const res = await apiClient.get('/admin/commissions/history');
    return res.data;
  },
  getCommissionAuditLogs: async () => {
    const res = await apiClient.get('/admin/commissions/audit');
    return res.data;
  },
  // ===== ENTERPRISE REVIEWS & REPUTATION =====
  getReviewDashboard: async () => {
    const res = await apiClient.get('/admin/reviews/dashboard');
    return res.data?.data;
  },
  getReviewAnalytics: async () => {
    const res = await apiClient.get('/admin/reviews/analytics');
    return res.data?.data;
  },
  getReviews: async (params?: any) => {
    const res = await apiClient.get('/admin/reviews', { params });
    return res.data;
  },
  getReviewDetails: async (id: string) => {
    const res = await apiClient.get(`/admin/reviews/${id}`);
    return res.data?.data;
  },
  approveReview: async (id: string, reason?: string) => {
    const res = await apiClient.put(`/admin/reviews/${id}/approve`, { reason });
    return res.data?.data;
  },
  hideReview: async (id: string, reason?: string) => {
    const res = await apiClient.put(`/admin/reviews/${id}/hide`, { reason });
    return res.data?.data;
  },
  unhideReview: async (id: string, reason?: string) => {
    const res = await apiClient.put(`/admin/reviews/${id}/unhide`, { reason });
    return res.data?.data;
  },

  deleteReview: async (id: string, reason?: string) => {
    const res = await apiClient.delete(`/admin/reviews/${id}`, { data: { reason } });
    return res.data?.data;
  },

  // ===== ENTERPRISE DISPUTES MODULE =====
  getDisputeDashboard: async () => {
    const res = await apiClient.get('/admin/disputes/dashboard');
    return res.data?.data;
  },

  getDisputes: async (params?: any) => {
    const res = await apiClient.get('/admin/disputes', { params });
    return res.data;
  },

  getDisputeDetails: async (id: string) => {
    const res = await apiClient.get(`/admin/disputes/${id}`);
    return res.data?.data;
  },

  updateDisputeStatus: async (id: string, status: string) => {
    const res = await apiClient.put(`/admin/disputes/${id}/status`, { status });
    return res.data?.data;
  },

  resolveDispute: async (id: string, payload: { winner: string, resolutionNotes: string }) => {
    const res = await apiClient.post(`/admin/disputes/${id}/resolve`, payload);
    return res.data?.data;
  },

  addDisputeMessage: async (id: string, payload: { message: string, isInternal: boolean }) => {
    const res = await apiClient.post(`/admin/disputes/${id}/messages`, payload);
    return res.data?.data;
  },

  // ===== ENTERPRISE BANNERS CONFIGURATION =====
  getBanners: async (params?: any) => {
    const res = await apiClient.get('/admin/banners', { params });
    return res.data;
  },

  getBannerDetails: async (id: string) => {
    const res = await apiClient.get(`/admin/banners/${id}`);
    return res.data?.data;
  },

  createBanner: async (payload: any) => {
    const res = await apiClient.post('/admin/banners', payload);
    return res.data?.data;
  },

  updateBanner: async (id: string, payload: any) => {
    const res = await apiClient.put(`/admin/banners/${id}`, payload);
    return res.data?.data;
  },

  deleteBanner: async (id: string) => {
    const res = await apiClient.delete(`/admin/banners/${id}`);
    return res.data;
  },

  toggleBannerStatus: async (id: string) => {
    const res = await apiClient.put(`/admin/banners/${id}/toggle`);
    return res.data?.data;
  },

  // ===== ENTERPRISE CMS (BLOGS) =====
  getBlogs: async (params?: any) => {
    const res = await apiClient.get('/admin/cms/blogs', { params });
    return res.data;
  },

  getBlogDetails: async (id: string) => {
    const res = await apiClient.get(`/admin/cms/blogs/${id}`);
    return res.data?.data;
  },

  createBlog: async (payload: any) => {
    const res = await apiClient.post('/admin/cms/blogs', payload);
    return res.data?.data;
  },

  updateBlog: async (id: string, payload: any) => {
    const res = await apiClient.put(`/admin/cms/blogs/${id}`, payload);
    return res.data?.data;
  },

  deleteBlog: async (id: string) => {
    const res = await apiClient.delete(`/admin/cms/blogs/${id}`);
    return res.data;
  },

  getAgents: async (params?: PaginationParams) => {
    const res = await apiClient.get('/admin/agents', { params });
    return res.data;
  },

  assignTicket: async (ticketId: string, agentId: string) => {
    const res = await apiClient.post(`/admin/support/${ticketId}/assign`, { agentId });
    return res.data;
  }
};
