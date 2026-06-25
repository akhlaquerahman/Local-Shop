import { useEffect } from 'react';
import { socket } from '../socket';
import { RealtimeEvent } from '../events';

/**
 * React hook to hook into realtime websocket events and trigger states.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRealtimeEvent = (event: RealtimeEvent, callback: (payload: any) => void) => {
  useEffect(() => {
    socket.on(event, callback);
    
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
};

export default useRealtimeEvent;
