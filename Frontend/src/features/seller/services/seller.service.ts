import apiClient from '@/lib/apiClient';

export const sellerService = {
  // PRODUCTS
  async getProducts(params?: any) {
    const res = await apiClient.get('/seller/products', { params });
    return res.data.data;
  },
  async getBrands() {
    const res = await apiClient.get('/seller/brands');
    return res.data.data;
  },
  async getProduct(id: string) {
    const res = await apiClient.get(`/seller/products/${id}`);
    return res.data.data;
  },
  async getProductStats() {
    const res = await apiClient.get('/seller/products/stats');
    return res.data.data;
  },
  async createProduct(data: any) {
    const res = await apiClient.post('/seller/products', data);
    return res.data.data;
  },
  async updateProduct(id: string, data: any) {
    const res = await apiClient.patch(`/seller/products/${id}`, data);
    return res.data.data;
  },
  async deleteProduct(id: string) {
    const res = await apiClient.delete(`/seller/products/${id}`);
    return res.data;
  },

  // BULK UPLOAD
  async importProducts(data: { products: any[]; fileName: string }) {
    const res = await apiClient.post('/seller/products/import', data);
    return res.data.data;
  },
  async getImportHistory() {
    const res = await apiClient.get('/seller/products/import-history');
    return res.data.data;
  },

  // INVENTORY
  async getInventory() {
    const res = await apiClient.get('/seller/inventory');
    return res.data.data;
  },
  async updateInventory(id: string, data: any) {
    const res = await apiClient.patch(`/seller/inventory/${id}`, data);
    return res.data.data;
  },

  // ORDERS
  async getOrders(params?: any) {
    const res = await apiClient.get('/seller/orders', { params });
    return res.data.data;
  },
  async getOrderStats() {
    const res = await apiClient.get('/seller/orders/stats');
    return res.data.data;
  },
  async updateOrderStatus(id: string, status: string, verificationCode?: string) {
    const res = await apiClient.patch(`/seller/orders/${id}/status`, { status, verificationCode });
    return res.data.data;
  },

  // DELIVERY REQUESTS
  async getDeliveryRequests() {
    const res = await apiClient.get('/seller/delivery-requests');
    return res.data.data;
  },
  async getDeliveryRequestStats() {
    const res = await apiClient.get('/seller/delivery-requests/stats');
    return res.data.data;
  },
  async updateDeliveryRequest(id: string, data: { riderId?: string, orderStatus?: string }) {
    const res = await apiClient.patch(`/seller/delivery-requests/${id}`, data);
    return res.data.data;
  },

  async getOrderBids(id: string) {
    const res = await apiClient.get(`/seller/orders/${id}/bids`);
    return res.data.data;
  },
  async acceptRiderBid(id: string, riderId: string) {
    const res = await apiClient.post(`/seller/orders/${id}/accept-bid`, { riderId });
    return res.data.data;
  },

  // DELIVERY PARTNERS
  async getRiders() {
    const res = await apiClient.get('/seller/riders');
    return res.data.data;
  },
  async getRiderStats() {
    const res = await apiClient.get('/seller/riders/stats');
    return res.data.data;
  },

  // CUSTOMERS
  async getCustomers() {
    const res = await apiClient.get('/seller/customers');
    return res.data.data;
  },
  async getCustomerStats() {
    const res = await apiClient.get('/seller/customers/stats');
    return res.data.data;
  },

  // COUPONS
  async getCoupons() {
    const res = await apiClient.get('/seller/coupons');
    return res.data.data;
  },
  async getCouponStats() {
    const res = await apiClient.get('/seller/coupons/stats');
    return res.data.data;
  },
  async createCoupon(data: any) {
    const res = await apiClient.post('/seller/coupons', data);
    return res.data.data;
  },
  async updateCoupon(id: string, data: any) {
    const res = await apiClient.patch(`/seller/coupons/${id}`, data);
    return res.data.data;
  },
  async deleteCoupon(id: string) {
    const res = await apiClient.delete(`/seller/coupons/${id}`);
    return res.data;
  },
  // ANALYTICS & MARKETING
  async getAnalyticsOverview() {
    const res = await apiClient.get('/seller/analytics/overview');
    return res.data.data;
  },
  async getRevenueTrend() {
    const res = await apiClient.get('/seller/analytics/revenue');
    return res.data.data;
  },
  async getOrdersTrend() {
    const res = await apiClient.get('/seller/analytics/orders');
    return res.data.data;
  },
  async getProductAnalytics() {
    const res = await apiClient.get('/seller/analytics/products');
    return res.data.data;
  },
  async getCustomerAnalytics() {
    const res = await apiClient.get('/seller/analytics/customers');
    return res.data.data;
  },
  async getPromotions() {
    const res = await apiClient.get('/seller/promotions');
    return res.data.data;
  },
  async createPromotion(data: any) {
    const res = await apiClient.post('/seller/promotions', data);
    return res.data.data;
  },
  async updatePromotion(id: string, data: any) {
    const res = await apiClient.patch(`/seller/promotions/${id}`, data);
    return res.data.data;
  },
  async deletePromotion(id: string) {
    const res = await apiClient.delete(`/seller/promotions/${id}`);
    return res.data;
  },
  async getMarketingOverview() {
    const res = await apiClient.get('/seller/marketing/overview');
    return res.data.data;
  },
  async getMarketingActivity() {
    const res = await apiClient.get('/seller/marketing/activity');
    return res.data.data;
  },

  // OPERATIONS & MANAGEMENT
  async getRevenueOverview() {
    const res = await apiClient.get('/seller/revenue/overview');
    return res.data.data;
  },
  async getRevenueChart() {
    const res = await apiClient.get('/seller/revenue/chart');
    return res.data.data;
  },
  async getTransactions() {
    const res = await apiClient.get('/seller/revenue/transactions');
    return res.data.data;
  },
  async getPayouts() {
    const res = await apiClient.get('/seller/payouts');
    return res.data.data;
  },
  async getPayoutSummary() {
    const res = await apiClient.get('/seller/payouts/summary');
    return res.data.data;
  },
  async requestPayout(data: any) {
    const res = await apiClient.post('/seller/payouts/request', data);
    return res.data.data;
  },
  async getReviews(params?: any) {
    const res = await apiClient.get('/seller/reviews', { params });
    return res.data.data;
  },
  async replyToReview(data: { reviewId: string; reply: string }) {
    const res = await apiClient.post('/seller/reviews/reply', data);
    return res.data.data;
  },
  async getSettings() {
    const res = await apiClient.get('/seller/settings');
    return res.data.data;
  },
  async updateSettings(data: any) {
    const res = await apiClient.patch('/seller/settings', data);
    return res.data.data;
  },
  async getStaff() {
    const res = await apiClient.get('/seller/staff');
    return res.data.data;
  },
  async createStaff(data: any) {
    const res = await apiClient.post('/seller/staff', data);
    return res.data.data;
  },
  async updateStaff(id: string, data: any) {
    const res = await apiClient.patch(`/seller/staff/${id}`, data);
    return res.data.data;
  },
  async deleteStaff(id: string) {
    const res = await apiClient.delete(`/seller/staff/${id}`);
    return res.data;
  },

  // ACCOUNT & COMPLIANCE
  async getKyc() {
    const res = await apiClient.get('/seller/kyc');
    return res.data.data;
  },
  async uploadKyc(data: any) {
    const res = await apiClient.post('/seller/kyc/upload', data);
    return res.data.data;
  },
  async getNotifications() {
    const res = await apiClient.get('/seller/notifications');
    return res.data.data;
  },
  async markNotificationRead(id: string) {
    const res = await apiClient.patch(`/seller/notifications/${id}/read`);
    return res.data;
  },
  async getTickets() {
    const res = await apiClient.get('/seller/support');
    return res.data.data;
  },
  async getTicketById(id: string) {
    const res = await apiClient.get(`/support/${id}`);
    return res.data.data;
  },
  async createTicket(data: any) {
    const res = await apiClient.post('/seller/support', data);
    return res.data.data;
  },
  async replyTicket(id: string, message: string) {
    const res = await apiClient.post(`/support/${id}/reply`, { message });
    return res.data.data;
  },
  async resolveTicket(id: string) {
    const res = await apiClient.put(`/support/${id}/resolve`);
    return res.data.data;
  },
  async getReports() {
    const res = await apiClient.get('/seller/reports');
    return res.data.data;
  },
  async generateReport(data: any) {
    const res = await apiClient.post('/seller/reports/generate', data);
    return res.data.data;
  },
  async getProfile() {
    const res = await apiClient.get('/seller/profile');
    return res.data.data;
  },
  async updateProfile(data: any) {
    const res = await apiClient.patch('/seller/profile', data);
    return res.data.data;
  },
  async getShopLocation() {
    const res = await apiClient.get('/seller/shop/location');
    return res.data.location;
  },
  async updateShopLocation(data: any) {
    const res = await apiClient.put('/seller/shop/location', data);
    return res.data.location;
  },
  async getSecurity() {
    const res = await apiClient.get('/seller/security');
    return res.data.data;
  },
  async logoutAllSessions() {
    const res = await apiClient.post('/seller/security/logout-all');
    return res.data;
  },
  async getAuditLogs() {
    const res = await apiClient.get('/seller/audit-logs');
    return res.data.data;
  }
};
