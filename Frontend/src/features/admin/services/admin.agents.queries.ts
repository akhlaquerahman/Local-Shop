import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export const adminAgentsKeys = {
  all: ['admin-agents'] as const,
  roles: ['admin-agent-roles'] as const,
};

// API Calls
const fetchAgents = async () => {
  const { data } = await apiClient.get('/admin/agents');
  return data;
};

const createAgent = async (payload: any) => {
  const { data } = await apiClient.post('/admin/agents', payload);
  return data;
};

const updateAgent = async ({ id, data }: { id: string; data: any }) => {
  const response = await apiClient.put(`/admin/agents/${id}`, data);
  return response.data;
};

const deleteAgent = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/agents/${id}`);
  return data;
};

const fetchRoles = async () => {
  const { data } = await apiClient.get('/admin/agents/roles');
  return data.data; // { success: true, data: [...] }
};

// Hooks
export const useAdminAgents = () => {
  return useQuery({
    queryKey: adminAgentsKeys.all,
    queryFn: fetchAgents,
  });
};

export const useAdminAgentRoles = () => {
  return useQuery({
    queryKey: adminAgentsKeys.roles,
    queryFn: fetchRoles,
  });
};

export const useCreateAdminAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAgentsKeys.all });
    },
  });
};

export const useUpdateAdminAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAgentsKeys.all });
    },
  });
};

export const useDeleteAdminAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAgentsKeys.all });
    },
  });
};

const createRole = async (payload: any) => {
  const { data } = await apiClient.post('/admin/agents/roles', payload);
  return data;
};

const updateRole = async ({ id, data }: { id: string; data: any }) => {
  const response = await apiClient.put(`/admin/agents/roles/${id}`, data);
  return response.data;
};

const deleteRole = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/agents/roles/${id}`);
  return data;
};

export const useCreateAdminRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAgentsKeys.roles });
    },
  });
};

export const useUpdateAdminRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAgentsKeys.roles });
    },
  });
};

export const useDeleteAdminRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAgentsKeys.roles });
    },
  });
};
