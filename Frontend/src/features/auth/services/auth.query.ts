import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { MOCK_PROFILES } from '@/mock/auth/mockUsers';

export const useCurrentUserProfileQuery = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['auth', 'profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Simulate API fetch delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Retrieve extended mock user profile (with geofencing lists, shopIds, etc.)
      return MOCK_PROFILES[user.role] || user;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache validity
  });
};
