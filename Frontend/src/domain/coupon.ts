export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  targetId: string; // ShopId or ProductId
  targetType: 'shop' | 'product';
  rating: number;
  comment?: string;
  reply?: string;
  createdAt: string;
}
