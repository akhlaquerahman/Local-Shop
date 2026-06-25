import { REALTIME_EVENTS, RealtimeEvent } from './events';
import { useNotificationStore } from '@/store/notificationStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (payload: any) => void;

/**
 * Mock WebSocket connection client.
 * Simulates server-side event broadcasts in development.
 */
class MockSocket {
  private listeners: Record<string, EventCallback[]> = {};
  private intervalId: NodeJS.Timeout | null = null;

  public connect() {
    console.log('[MockSocket] Establishing connection link...');
    this.startSimulation();
  }

  public disconnect() {
    console.log('[MockSocket] Connection link severed.');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public on(event: RealtimeEvent, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: RealtimeEvent, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit(event: string, payload: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(payload));
    }
  }

  private startSimulation() {
    // Fire periodic mockup events to verify dashboard widgets behave correctly
    this.intervalId = setInterval(() => {
      const rand = Math.random();
      const { addToast, addNotification } = useNotificationStore.getState();

      if (rand < 0.3) {
        // Simulate a new order incoming event
        const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        this.emit('ORDER_ASSIGNED', {
          orderId,
          status: 'ready_for_pickup',
          timestamp: new Date().toISOString(),
        });

      } else if (rand < 0.6) {
        // Simulate a payout processed notification

      } else {
        // Emit a system heartbeat check
        this.emit('SYSTEM_ALERT', {
          message: 'Marketplace network nodes fully synchronized.',
          timestamp: new Date().toISOString(),
        });
      }
    }, 25000); // Trigger every 25 seconds
  }
}

export const socket = new MockSocket();
export default socket;
