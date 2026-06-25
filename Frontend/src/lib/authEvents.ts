type AuthEvent = 
  | 'login' 
  | 'logout' 
  | 'sessionExpired' 
  | 'roleChanged' 
  | 'impersonationStarted' 
  | 'impersonationEnded';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthEventCallback = (payload?: any) => void;

/**
 * Global Authentication Event Bus.
 * Decouples security listeners (timers, axios) from Zustand state updates.
 */
class AuthEventBus {
  private listeners: Record<string, AuthEventCallback[]> = {};

  public subscribe(event: AuthEvent, callback: AuthEventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  }

  public unsubscribe(event: AuthEvent, callback: AuthEventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public publish(event: AuthEvent, payload?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(payload));
    }
  }
}

export const authEvents = new AuthEventBus();
export default authEvents;
