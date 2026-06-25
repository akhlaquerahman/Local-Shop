/**
 * Realtime Event Types for Socket Channels
 */
export const REALTIME_EVENTS = {
  // Order Flows
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  ORDER_ASSIGNED: 'ORDER_ASSIGNED',
  
  // Deliveries / Rider Coordinates
  LOCATION_UPDATED: 'LOCATION_UPDATED',
  
  // Communications
  NEW_CHAT_MESSAGE: 'NEW_CHAT_MESSAGE',
  TYPING_INDICATOR: 'TYPING_INDICATOR',

  // Administrative Alerts
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  NOTIFICATION_TRIGGERED: 'NOTIFICATION_TRIGGERED',
} as const;

export type RealtimeEvent = keyof typeof REALTIME_EVENTS;

// Event Payload Interfaces
export interface OrderStatusPayload {
  orderId: string;
  status: string;
  timestamp: string;
  note?: string;
}

export interface LocationPayload {
  riderId: string;
  lat: number;
  lng: number;
  bearing?: number;
}

export interface ChatMessagePayload {
  channelId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}
