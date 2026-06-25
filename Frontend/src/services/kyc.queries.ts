import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kycService } from './kyc.service';

export const useMyKycDocuments = () => {
  return useQuery({
    queryKey: ['my-kyc'],
    queryFn: () => kycService.getMyDocuments()
  });
};

export const useUploadKycDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => kycService.uploadDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-kyc'] });
    }
  });
};

export const useReuploadKycDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => kycService.reuploadDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-kyc'] });
    }
  });
};

// Admin Queries
export const useAdminKyc = (params?: any) => {
  return useQuery({
    queryKey: ['admin-kyc', params],
    queryFn: () => kycService.adminGetAllKyc(params)
  });
};

export const useAdminApproveKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kycService.adminApproveKyc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
    }
  });
};

export const useAdminRejectKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => kycService.adminRejectKyc(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
    }
  });
};

export const useAdminRequestReupload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => kycService.adminRequestReupload(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
    }
  });
};
