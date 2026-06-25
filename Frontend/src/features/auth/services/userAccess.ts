import { User } from '@/domain/user';

export type UserAccessState = 
  | 'active'
  | 'pending_verification'
  | 'under_review'
  | 'suspended'
  | 'blocked';

/**
 * Centralized evaluator of account state restrictions.
 * Prevents pending or suspended profiles from browsing functional dashboards.
 */
export const getUserAccessState = (user: User | null): UserAccessState => {
  if (!user) return 'blocked';
  
  const status = (user.status || '').toLowerCase();
  
  if (status === 'suspended') return 'suspended';
  
  if (status === 'pending_verification') return 'pending_verification';
  
  if (status === 'pending_kyc' || status === 'under_review') return 'under_review';
  
  // Fallback for legacy mock 'pending' states
  if (status === 'pending') {
    if (user.role === 'seller' || user.role === 'rider') {
      return 'under_review';
    }
    return 'pending_verification';
  }
  
  if (status === 'active') {
    return 'active';
  }
  
  return 'blocked';
};
