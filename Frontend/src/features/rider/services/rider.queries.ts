import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riderService } from './rider.service';

export const useRiderDashboard = () => {
  return useQuery({
    queryKey: ['rider-dashboard'],
    queryFn: riderService.getDashboard
  });
};

export const useAvailableDeliveries = (params?: any) => {
  return useQuery({
    queryKey: ['rider-available', params],
    queryFn: () => riderService.getAvailableDeliveries(params)
  });
};

export const useRequestDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: riderService.requestDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-available'] });
      queryClient.invalidateQueries({ queryKey: ['rider-requests'] });
    }
  });
};

export const useRiderRequests = () => {
  return useQuery({
    queryKey: ['rider-requests'],
    queryFn: riderService.getRequests
  });
};

export const useAssignedDeliveries = () => {
  return useQuery({
    queryKey: ['rider-assigned'],
    queryFn: riderService.getAssignedDeliveries
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: riderService.updateDeliveryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-assigned'] });
      queryClient.invalidateQueries({ queryKey: ['rider-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rider-in-transit'] });
      queryClient.invalidateQueries({ queryKey: ['rider-completed'] });
    }
  });
};

export const useInTransitDelivery = () => {
  return useQuery({
    queryKey: ['rider-in-transit'],
    queryFn: riderService.getInTransitDelivery
  });
};

export const useCompletedDeliveries = (params?: any) => {
  return useQuery({
    queryKey: ['rider-completed', params],
    queryFn: () => riderService.getCompletedDeliveries(params)
  });
};

export const useFailedDeliveries = (params?: any) => {
  return useQuery({
    queryKey: ['rider-failed', params],
    queryFn: () => riderService.getFailedDeliveries(params)
  });
};

export const useRiderEarnings = () => {
  return useQuery({
    queryKey: ['rider-earnings'],
    queryFn: riderService.getEarnings
  });
};

export const useRiderPayouts = () => {
  return useQuery({
    queryKey: ['rider-payouts'],
    queryFn: riderService.getPayouts
  });
};

// PHASE 3
export const useRiderWallet = () => useQuery({ queryKey: ['rider-wallet'], queryFn: riderService.getWallet });
export const useRiderRatings = () => useQuery({ queryKey: ['rider-ratings'], queryFn: riderService.getRatings });
export const useRiderDocuments = () => useQuery({ queryKey: ['rider-documents'], queryFn: riderService.getDocuments });
export const useRiderKyc = () => useQuery({ queryKey: ['rider-kyc'], queryFn: riderService.getKycStatus });
export const useRiderNotifications = () => useQuery({ queryKey: ['rider-notifications'], queryFn: riderService.getNotifications });
export const useRiderSupportTickets = () => useQuery({ queryKey: ['rider-support'], queryFn: riderService.getSupportTickets });

export const useTicketById = (id: string) => {
  return useQuery({
    queryKey: ['rider-ticket', id],
    queryFn: () => riderService.getTicketById(id),
    enabled: !!id
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => riderService.createSupportTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-support'] });
    }
  });
};

export const useReplyTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => riderService.replyTicket(id, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rider-ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['rider-support'] });
    }
  });
};

export const useResolveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => riderService.resolveTicket(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rider-ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['rider-support'] });
    }
  });
};

export const useRiderProfile = () => useQuery({ queryKey: ['rider-profile'], queryFn: riderService.getProfile });

export const useUpdateRiderProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: riderService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-profile'] });
    }
  });
};

export const useRiderSecurity = () => useQuery({ queryKey: ['rider-security'], queryFn: riderService.getSecurity });
export const useRiderSettings = () => useQuery({ queryKey: ['rider-settings'], queryFn: riderService.getSettings });

export const useRiderServiceAreas = () => useQuery({ queryKey: ['rider-service-areas'], queryFn: riderService.getServiceAreas });

export const useAddServiceArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: riderService.addServiceArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-service-areas'] });
      queryClient.invalidateQueries({ queryKey: ['rider-profile'] });
    }
  });
};

export const useUpdateServiceArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: riderService.updateServiceArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-service-areas'] });
      queryClient.invalidateQueries({ queryKey: ['rider-profile'] });
    }
  });
};

export const useDeleteServiceArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: riderService.deleteServiceArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-service-areas'] });
      queryClient.invalidateQueries({ queryKey: ['rider-profile'] });
    }
  });
};
