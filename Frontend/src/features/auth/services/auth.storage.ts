import { UserSession, User } from '@/domain/user';
import { SECURITY_CONSTANTS } from '@/constants/security';

export interface ImpersonationState {
  admin: User;
  impersonationStartedAt: string;
  impersonatedUserId: string;
}

export const authStorage = {
  getSession(): UserSession | null {
    try {
      const data = localStorage.getItem(SECURITY_CONSTANTS.STORAGE_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[Auth Storage] Failed to get session', e);
      return null;
    }
  },

  setSession(session: UserSession): void {
    try {
      localStorage.setItem(SECURITY_CONSTANTS.STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.error('[Auth Storage] Failed to set session', e);
    }
  },

  clearSession(): void {
    try {
      localStorage.removeItem(SECURITY_CONSTANTS.STORAGE_KEYS.SESSION);
    } catch (e) {
      console.error('[Auth Storage] Failed to clear session', e);
    }
  },

  getRememberMe(): string | null {
    try {
      return localStorage.getItem(SECURITY_CONSTANTS.STORAGE_KEYS.REMEMBER_ME);
    } catch (e) {
      return null;
    }
  },

  setRememberMe(email: string): void {
    try {
      localStorage.setItem(SECURITY_CONSTANTS.STORAGE_KEYS.REMEMBER_ME, email);
    } catch (e) {
      console.error('[Auth Storage] Failed to set remember me', e);
    }
  },

  clearRememberMe(): void {
    try {
      localStorage.removeItem(SECURITY_CONSTANTS.STORAGE_KEYS.REMEMBER_ME);
    } catch (e) {
      console.error('[Auth Storage] Failed to clear remember me', e);
    }
  },

  // Impersonation Storage Helpers
  getOriginalAdmin(): ImpersonationState | null {
    try {
      const data = localStorage.getItem('localshop_original_admin');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setOriginalAdmin(admin: User, impersonatedUserId: string): void {
    try {
      const state: ImpersonationState = {
        admin,
        impersonationStartedAt: new Date().toISOString(),
        impersonatedUserId,
      };
      localStorage.setItem('localshop_original_admin', JSON.stringify(state));
    } catch (e) {
      console.error('[Auth Storage] Failed to set original admin state', e);
    }
  },

  clearOriginalAdmin(): void {
    try {
      localStorage.removeItem('localshop_original_admin');
    } catch (e) {
      console.error('[Auth Storage] Failed to clear original admin state', e);
    }
  },
};
export default authStorage;
