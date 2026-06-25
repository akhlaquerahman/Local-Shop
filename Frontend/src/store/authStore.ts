import { create } from 'zustand';
import { User, UserSession } from '@/domain/user';
import { authStorage } from '@/features/auth/services/auth.storage';
import { authSessionManager } from '@/features/auth/services/auth.session';
import { authEvents } from '@/lib/authEvents';
import { auditService } from '@/services/audit/audit.service';
import { authService } from '@/features/auth/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  originalAdminUser: User | null; // Stores admin user profile during impersonation
  login: (session: UserSession) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  syncUser: () => Promise<void>;
  impersonateUser: (targetUser: User) => void;
  stopImpersonation: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Load session and original admin from storage on startup
  const savedSession = authStorage.getSession();
  const savedAdminState = authStorage.getOriginalAdmin();

  // If there's an existing session, start monitoring immediately
  if (savedSession) {
    // Run after store instantiation
    setTimeout(() => {
      authSessionManager.startMonitoring();
      get().syncUser();
    }, 0);
  }

  return {
    user: savedSession ? savedSession.user : null,
    token: savedSession ? savedSession.token : null,
    refreshToken: savedSession ? savedSession.refreshToken : null,
    isAuthenticated: savedSession ? true : false,
    originalAdminUser: savedAdminState ? savedAdminState.admin : null,

    login: (session: UserSession) => {
      authStorage.setSession(session);
      set({
        user: session.user,
        token: session.token,
        refreshToken: session.refreshToken,
        isAuthenticated: true,
      });
      authSessionManager.startMonitoring();
    },

    logout: () => {
      authStorage.clearSession();
      authStorage.clearOriginalAdmin();
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        originalAdminUser: null,
      });
      authSessionManager.stopMonitoring();
    },

    syncUser: async () => {
      try {
        const state = get();
        if (!state.token || state.originalAdminUser) return; // Don't sync if impersonating
        
        const freshUser = await authService.getMe();
        
        const updatedSession: UserSession = {
          token: state.token,
          refreshToken: state.refreshToken || '',
          user: freshUser,
        };
        
        authStorage.setSession(updatedSession);
        set({ user: freshUser });
      } catch (err) {
        // If syncing fails (e.g., token invalid/suspended), let the Axios interceptor handle logout
      }
    },

    updateUser: (userData: Partial<User>) => {
      const state = get();
      if (!state.user) return;
      
      const updatedUser = { ...state.user, ...userData };
      const updatedSession: UserSession = {
        token: state.token || '',
        refreshToken: state.refreshToken || '',
        user: updatedUser,
      };

      authStorage.setSession(updatedSession);
      set({ user: updatedUser });
    },

    impersonateUser: (targetUser: User) => {
      const state = get();
      if (!state.user) return;

      // Ensure only admins/sub-admins can impersonate
      if (state.user.role !== 'admin' && state.user.role !== 'sub_admin') {
        console.error('[Impersonation] Insufficient permissions to impersonate.');
        return;
      }

      // Store the admin profile
      const adminUser = state.user;
      
      // Update session with target user details (retain original admin tokens)
      const impersonatedSession: UserSession = {
        token: state.token || '',
        refreshToken: state.refreshToken || '',
        user: targetUser,
      };

      authStorage.setSession(impersonatedSession);
      authStorage.setOriginalAdmin(adminUser, targetUser.id);
      
      set({
        user: targetUser,
        originalAdminUser: adminUser,
      });

      auditService.logSecurityEvent('IMPERSONATION_STARTED', adminUser, {
        targetUserId: targetUser.id,
        targetUserEmail: targetUser.email,
        targetUserRole: targetUser.role,
        impersonationStartedAt: new Date().toISOString(),
        impersonatedUserId: targetUser.id,
      });

      authEvents.publish('impersonationStarted', { admin: adminUser, target: targetUser });
      
      // Reset activity timer
      authSessionManager.ping();
    },

    stopImpersonation: () => {
      const state = get();
      const admin = state.originalAdminUser;
      if (!admin) return;

      const restoredSession: UserSession = {
        token: state.token || '',
        refreshToken: state.refreshToken || '',
        user: admin,
      };

      authStorage.setSession(restoredSession);
      authStorage.clearOriginalAdmin();
      
      set({
        user: admin,
        originalAdminUser: null,
      });

      auditService.logSecurityEvent('IMPERSONATION_ENDED', admin, {
        stoppedTargetUserId: state.user?.id,
      });

      authEvents.publish('impersonationEnded', { admin });
      
      // Reset activity timer
      authSessionManager.ping();
    },
  };
});

// Event bus subscribers to sync cross-layer triggers
authEvents.subscribe('sessionExpired', () => {
  const user = useAuthStore.getState().user;
  if (user) {
    auditService.logSecurityEvent('LOGOUT', user, { reason: 'inactivity_timeout' });
  }
  useAuthStore.getState().logout();
  window.location.href = '/login?reason=session_expired';
});

authEvents.subscribe('logout', () => {
  useAuthStore.getState().logout();
  window.location.href = '/login';
});
