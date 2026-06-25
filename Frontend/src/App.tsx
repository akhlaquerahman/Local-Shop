import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
import { socket } from '@/realtime/socket';
import { useThemeStore } from '@/store/themeStore';

export const App: React.FC = () => {
  const { theme } = useThemeStore();

  // Connect and clean up the realtime socket simulation on app mount/unmount
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {/* Floating toast notification wrapper */}
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
