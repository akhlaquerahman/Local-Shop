export type NotificationType = 
  | 'order_status' 
  | 'payout_alert' 
  | 'chat_message' 
  | 'promo' 
  | 'system_alert'
  | 'kyc_update';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceId?: string; // e.g. Order ID, Payout ID
  createdAt: string;
}
