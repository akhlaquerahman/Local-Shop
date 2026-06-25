import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export const supportKeys = {
  all: ['user-support'] as const,
  lists: () => [...supportKeys.all, 'list'] as const,
  details: () => [...supportKeys.all, 'detail'] as const,
  detail: (id: string) => [...supportKeys.details(), id] as const,
};

const fetchTickets = async () => {
  const { data } = await apiClient.get('/support');
  return data.data;
};

const fetchTicketById = async (id: string) => {
  const { data } = await apiClient.get(`/support/${id}`);
  return data.data;
};

const createTicket = async (payload: { subject: string; category: string; message: string; priority?: string }) => {
  const { data } = await apiClient.post('/support', payload);
  return data.data;
};

const replyToTicket = async ({ id, message }: { id: string; message: string }) => {
  const { data } = await apiClient.post(`/support/${id}/reply`, { message });
  return data.data;
};

export const useUserSupportTickets = () => {
  return useQuery({
    queryKey: supportKeys.lists(),
    queryFn: fetchTickets,
  });
};

export const useUserSupportTicket = (id: string) => {
  return useQuery({
    queryKey: supportKeys.detail(id),
    queryFn: () => fetchTicketById(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() });
    },
  });
};

export const useUserReplyToTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replyToTicket,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supportKeys.detail(variables.id) });
    },
  });
};
