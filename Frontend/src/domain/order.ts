export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'packed'
  | 'ready_for_pickup'
  | 'assigned_to_rider'
  | 'arrived_at_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'arrived_at_destination'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'upi' | 'card' | 'wallet';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface DeliveryDetails {
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  deliveryAddress: string;
  deliveryCoordinates: {
    lat: number;
    lng: number;
  };
  deliveryFee: number;
  estimatedTimeMinutes?: number;
  pickedUpAt?: string;
  deliveredAt?: string;
  statusLog: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryDetails: DeliveryDetails;
  deliveryVerificationCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
