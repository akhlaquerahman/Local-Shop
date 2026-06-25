import { PermissionKey, UserRole } from '@/features/auth/permissions/roles';
import { hasPermission as resolvePermission } from './permissionResolver';

/**
 * Enterprise In-Memory Permission Cache.
 * Prevents re-computing role permission matrices on every re-render.
 */
class PermissionCache {
  private cache: Map<string, boolean> = new Map();

  /**
   * Evaluates if a role possesses a permission, checking the cache first.
   */
  public hasPermission(role: UserRole, permission: PermissionKey): boolean {
    const cacheKey = `${role}:${permission}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const result = resolvePermission({ role }, permission);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Resets the cache (must be called upon user logins, logouts, or role updates).
   */
  public clear(): void {
    this.cache.clear();
    console.log('[PermissionCache] Privilege caches cleared.');
  }
}

export const permissionCache = new PermissionCache();
export default permissionCache;
