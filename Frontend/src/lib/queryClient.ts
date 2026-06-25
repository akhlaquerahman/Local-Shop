import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes standard stale time
      refetchOnWindowFocus: false, // Avoid refetching when user toggles tabs in dashboard
      retry: 1, // Retry failed queries once before showing error page
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // Do not retry mutation transactions automatically
    },
  },
});
