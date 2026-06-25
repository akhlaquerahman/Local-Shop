import { UserRole } from '@/features/auth/permissions/roles';
import { 
  NavigationItem, 
  CUSTOMER_NAVIGATION, 
  SELLER_NAVIGATION, 
  RIDER_NAVIGATION, 
  ADMIN_NAVIGATION 
} from './navigationSchema';
import { hasPermission } from '@/lib/permissionResolver';
import { isFeatureEnabled } from '@/config/features';
import { permissionCache } from '@/lib/permissionCache';

/**
 * Filter list of menu items based on the user's role and feature flags.
 * Utilizes the permission cache for fast lookups.
 */
export const filterMenuItems = (
  items: NavigationItem[],
  user: any
): NavigationItem[] => {
  const role = user?.role;
  return items.filter((item) => {
    // 1. Check feature flags
    if (item.feature && !isFeatureEnabled(item.feature, role)) {
      return false;
    }

    // 2. Check allowed roles list
    if (item.allowedRoles && !item.allowedRoles.includes(role)) {
      return false;
    }

    // Explicit bypass for SELLER_OWNER
    if (user?.accountType === 'SELLER_OWNER') {
      return true;
    }

    // 3. Staff/Agent specific permission checking
    if (user?.isStaff || user?.isAgent) {
      if (item.permission) {
        if (!hasPermission(user, item.permission)) {
          return false;
        }
      }
    } else if (item.permission && !user?.isStaff && !user?.isAgent) {
      // Regular RBAC
      if (!permissionCache.hasPermission(role, item.permission)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Dynamically resolves the entire menu hierarchy for an authenticated user.
 */
export const getMenuForRole = (user: any): NavigationItem[] => {
  const role = user?.role || 'customer';
  switch (role) {
    case 'seller':
    case 'seller_staff':
      return filterMenuItems(SELLER_NAVIGATION, user);
    case 'rider':
      return filterMenuItems(RIDER_NAVIGATION, user);
    case 'admin':
    case 'sub_admin':
    case 'support_agent':
    case 'finance_admin':
    case 'catalog_manager':
    case 'city_manager':
      return filterMenuItems(ADMIN_NAVIGATION, user);
    case 'customer':
    default:
      return filterMenuItems(CUSTOMER_NAVIGATION, user);
  }
};
export default getMenuForRole;
