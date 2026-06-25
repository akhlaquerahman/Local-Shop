import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

let socket: Socket | null = null;

export const useRiderSocket = () => {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'rider') return;

    // Use environment variable or default to localhost
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    
    if (!socket) {
      socket = io(SOCKET_URL);
    }

    socket.on('connect', () => {
      setIsConnected(true);
      socket?.emit('join_rider', user.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [user]);

  return { socket, isConnected };
};
