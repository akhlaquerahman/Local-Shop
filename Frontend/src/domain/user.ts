import { UserRole } from '@/features/auth/permissions/roles';


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'pending' | 'pending_verification' | 'pending_kyc' | string;
  createdAt: string;
}

export interface UserSession {
  token: string;
  refreshToken: string;
  user: User;
}

export interface UserProfile extends User {
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
  };
  kycStatus?: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  metadata?: Record<string, unknown>;
}
