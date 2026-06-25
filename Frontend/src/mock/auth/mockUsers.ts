import { User } from '@/domain/user';
import { UserRole } from '@/features/auth/permissions/roles';

export interface MockUserProfile extends User {
  assignedCities?: string[];
  assignedZones?: string[];
  assignedWarehouses?: string[];
  currentShopId?: string;
  currentWarehouseId?: string;
}

/**
 * Mock user profiles representing the 4 core roles for RBAC verification.
 */
export const MOCK_PROFILES: Record<UserRole, MockUserProfile> = {
  customer: {
    id: 'usr-cust-101',
    name: 'Akhlesh Kumar',
    email: 'customer@localshop.app',
    role: 'customer',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    status: 'active',
    createdAt: '2026-01-10T12:00:00Z',
  },

  seller: {
    id: 'usr-sell-201',
    name: 'Rajesh Sharma',
    email: 'seller@localshop.app',
    role: 'seller',
    phone: '+91 99887 76655',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60',
    status: 'active',
    currentShopId: 'shop-1',
    createdAt: '2026-02-15T09:00:00Z',
  },

  rider: {
    id: 'usr-ride-301',
    name: 'Amit Patel',
    email: 'rider@localshop.app',
    role: 'rider',
    phone: '+91 91234 56789',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    status: 'active',
    currentWarehouseId: 'wh-noida-1',
    createdAt: '2026-03-01T10:30:00Z',
  },

  admin: {
    id: 'usr-admin-001',
    name: 'Aditya Birla',
    email: 'admin@localshop.app',
    role: 'admin',
    phone: '+91 90000 11111',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=60',
    status: 'active',
    createdAt: '2025-12-01T08:00:00Z',
  },
};
