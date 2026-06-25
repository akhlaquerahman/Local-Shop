import apiClient from '@/lib/apiClient';

export interface StaffRole {
  _id: string;
  id?: string;
  shopId: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  staffCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const rolesService = {
  getRoles: async (): Promise<StaffRole[]> => {
    const res = await apiClient.get('/seller/staff/roles');
    return res.data.data;
  },
  
  createRole: async (data: { name: string; description: string; permissions: string[] }): Promise<StaffRole> => {
    const res = await apiClient.post('/seller/staff/roles', data);
    return res.data.data;
  },

  updateRole: async (id: string, data: Partial<{ name: string; description: string; permissions: string[] }>): Promise<StaffRole> => {
    const res = await apiClient.patch(`/seller/staff/roles/${id}`, data);
    return res.data.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/seller/staff/roles/${id}`);
  }
};
