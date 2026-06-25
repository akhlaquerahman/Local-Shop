import apiClient from '@/lib/apiClient';

export const kycService = {
  uploadDocument: async (data: any) => {
    const res = await apiClient.post('/kyc/upload', data);
    return res.data;
  },

  getMyDocuments: async () => {
    const res = await apiClient.get('/kyc/my-documents');
    return res.data;
  },

  reuploadDocument: async (id: string, data: any) => {
    const res = await apiClient.put(`/kyc/reupload/${id}`, data);
    return res.data;
  },

  // Admin APIs
  adminGetAllKyc: async (params?: any) => {
    const res = await apiClient.get('/admin/kyc', { params });
    return res.data;
  },

  adminGetKycById: async (id: string) => {
    const res = await apiClient.get(`/admin/kyc/${id}`);
    return res.data;
  },

  adminApproveKyc: async (id: string) => {
    const res = await apiClient.put(`/admin/kyc/approve/${id}`);
    return res.data;
  },

  adminRejectKyc: async (id: string, rejectionReason: string) => {
    const res = await apiClient.put(`/admin/kyc/reject/${id}`, { rejectionReason });
    return res.data;
  },

  adminRequestReupload: async (id: string, reason: string) => {
    const res = await apiClient.put(`/admin/kyc/reupload/${id}`, { reason });
    return res.data;
  }
};
