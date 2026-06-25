import { SECURITY_CONSTANTS } from '@/constants/security';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  event: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  getLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(SECURITY_CONSTANTS.STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[Audit Service] Failed to retrieve logs', e);
      return [];
    }
  },

  logSecurityEvent(
    event: 'LOGIN' | 'LOGOUT' | 'IMPERSONATION_STARTED' | 'IMPERSONATION_ENDED' | 'PASSWORD_CHANGED' | 'ROLE_CHANGED' | 'PERMISSION_DENIED',
    user: { id: string; name: string; email: string; role: string },
    details?: Record<string, unknown>
  ): void {
    try {
      const logs = this.getLogs();
      const newEntry: AuditLogEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        event,
        details,
        ipAddress: '127.0.0.1', // Mock IP
        userAgent: navigator.userAgent,
      };

      logs.unshift(newEntry);
      
      // Limit logs size to 100 entries for local storage budget
      const trimmedLogs = logs.slice(0, 100);
      
      localStorage.setItem(
        SECURITY_CONSTANTS.STORAGE_KEYS.AUDIT_LOGS,
        JSON.stringify(trimmedLogs)
      );
      
      console.log(`[Audit Service] Security event logged: ${event}`, newEntry);
    } catch (e) {
      console.error('[Audit Service] Failed to write security event', e);
    }
  },

  clearLogs(): void {
    try {
      localStorage.removeItem(SECURITY_CONSTANTS.STORAGE_KEYS.AUDIT_LOGS);
    } catch (e) {
      console.error('[Audit Service] Failed to clear logs', e);
    }
  },
};

export default auditService;
