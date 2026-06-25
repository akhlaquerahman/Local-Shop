export type ShopStatus = 'pending_approval' | 'active' | 'suspended' | 'closed';

export interface ShopCoordinates {
  lat: number;
  lng: number;
  address: string;
}

export interface ShopOperatingHours {
  open: string;  // HH:MM format
  close: string; // HH:MM format
  daysOpen: number[]; // 0-6 (Sunday to Saturday)
}

export interface Shop {
  id: string;
  sellerId: string; // User ID of the owner
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl?: string;
  status: ShopStatus;
  category: string;
  rating: number;
  orderCount: number;
  coordinates: ShopCoordinates;
  operatingHours: ShopOperatingHours;
  isFeatured: boolean;
  commissionRate: number; // Admin commission percentage (e.g. 10 for 10%)
  createdAt: string;
  updatedAt: string;
}

export interface ShopKyc {
  shopId: string;
  gstin?: string;
  panNumber: string;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    holderName: string;
  };
  documentUrls: {
    panCard: string;
    gstCertificate?: string;
    addressProof: string;
  };
  status: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
