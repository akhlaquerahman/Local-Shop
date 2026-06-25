import apiClient from '@/lib/apiClient';

export const riderService = {
  async getDashboard() {
    const res = await apiClient.get('/rider/dashboard');
    return res.data.data;
  },
  async getAvailableDeliveries(params?: any) {
    const res = await apiClient.get('/rider/deliveries/available', { params });
    return res.data.data;
  },
  async requestDelivery(id: string) {
    const res = await apiClient.post(`/rider/deliveries/${id}/request`);
    return res.data.data;
  },
  async getRequests() {
    const res = await apiClient.get('/rider/requests');
    return res.data.data;
  },
  async getAssignedDeliveries() {
    const res = await apiClient.get('/rider/deliveries/assigned');
    return res.data.data;
  },
  async updateDeliveryStatus({ id, status, verificationCode }: { id: string, status: string, verificationCode?: string }) {
    const res = await apiClient.patch(`/rider/deliveries/${id}/status`, { status, verificationCode });
    return res.data.data;
  },
  async getInTransitDelivery() {
    const res = await apiClient.get('/rider/deliveries/in-transit');
    return res.data.data;
  },
  async getCompletedDeliveries(params?: any) {
    const res = await apiClient.get('/rider/deliveries/completed', { params });
    return res.data.data;
  },
  async getFailedDeliveries(params?: any) {
    const res = await apiClient.get('/rider/deliveries/failed', { params });
    return res.data.data;
  },
  async getEarnings() {
    const res = await apiClient.get('/rider/earnings');
    return res.data.data;
  },
  async getPayouts() {
    const res = await apiClient.get('/rider/payouts');
    return res.data.data;
  },

  // PHASE 3
  async getWallet() {
    const res = await apiClient.get('/rider/wallet');
    return res.data.data;
  },
  async getRatings() {
    const res = await apiClient.get('/rider/ratings');
    return res.data.data;
  },
  async getDocuments() {
    const res = await apiClient.get('/rider/documents');
    return res.data.data;
  },
  async getKycStatus() {
    const res = await apiClient.get('/rider/kyc');
    return res.data.data;
  },
  async getNotifications() {
    const res = await apiClient.get('/rider/notifications');
    return res.data.data;
  },
  async readNotifications() {
    const res = await apiClient.patch('/rider/notifications/read');
    return res.data.data;
  },
  async getSupportTickets() {
    const res = await apiClient.get('/rider/support/tickets');
    return res.data.data;
  },
  async getTicketById(id: string) {
    const res = await apiClient.get(`/support/${id}`);
    return res.data.data;
  },
  async createSupportTicket(data: any) {
    const res = await apiClient.post('/rider/support/tickets', data);
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
  async getProfile() {
    const res = await apiClient.get('/rider/profile');
    return res.data.data;
  },
  async updateProfile(data: any) {
    const res = await apiClient.patch('/rider/profile', data);
    return res.data.data;
  },
  async getSecurity() {
    const res = await apiClient.get('/rider/security');
    return res.data.data;
  },
  async getSettings() {
    const res = await apiClient.get('/rider/settings');
    return res.data.data;
  },
  async getServiceAreas() {
    const res = await apiClient.get('/rider/service-areas');
    return res.data.data;
  },
  async addServiceArea(data: any) {
    const res = await apiClient.post('/rider/service-areas', data);
    return res.data.data;
  },
  async updateServiceArea({ id, data }: { id: string, data: any }) {
    const res = await apiClient.patch(`/rider/service-areas/${id}`, data);
    return res.data.data;
  },
  async deleteServiceArea(id: string) {
    const res = await apiClient.delete(`/rider/service-areas/${id}`);
    return res.data.data;
  }
};
