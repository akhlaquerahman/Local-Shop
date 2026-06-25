export type ProductStatus = 'draft' | 'published' | 'out_of_stock' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  parentId?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number; // For discounts
  costPrice?: number; // Seller catalog details
  imageUrl: string;
  images?: string[];
  category: string;
  stock: number;
  threshold: number; // Low stock indicator
  status: ProductStatus;
  isHyperlocal: boolean; // Hyperlocal specific eligibility
  weightGrams?: number; // Shipping/Delivery calculations
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}
