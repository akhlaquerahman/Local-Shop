import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export const adminSupportKeys = {
  all: ['admin-support'] as const,
  lists: () => [...adminSupportKeys.all, 'list'] as const,
  list: (filters: string) => [...adminSupportKeys.lists(), { filters }] as const,
  details: () => [...adminSupportKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminSupportKeys.details(), id] as const,
};

const fetchTickets = async () => {
  const { data } = await apiClient.get('/admin/support-tickets');
  return data.data;
};

const fetchTicketById = async (id: string) => {
  const { data } = await apiClient.get(`/admin/support-tickets/${id}`);
  return data.data;
};

const assignTicket = async ({ id, agentId }: { id: string; agentId: string }) => {
  const { data } = await apiClient.put(`/admin/support-tickets/${id}/assign`, { agentId });
  return data.data;
};

const replyToTicket = async ({ id, message }: { id: string; message: string }) => {
  const { data } = await apiClient.post(`/admin/support-tickets/${id}/messages`, { message });
  return data.data;
};

const resolveTicket = async (id: string) => {
  const { data } = await apiClient.put(`/admin/support-tickets/${id}/resolve`);
  return data.data;
};

export const useAdminSupportTickets = () => {
  return useQuery({
    queryKey: adminSupportKeys.lists(),
    queryFn: fetchTickets,
  });
};

export const useAdminSupportTicket = (id: string) => {
  return useQuery({
    queryKey: adminSupportKeys.detail(id),
    queryFn: () => fetchTicketById(id),
    enabled: !!id,
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignTicket,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.detail(variables.id) });
    },
  });
};

export const useReplyToTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replyToTicket,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.detail(variables.id) });
    },
  });
};

export const useResolveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveTicket,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.detail(variables) });
    },
  });
};
