import { UserRole } from '@/constants/permissions';

export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetId?: string;
  targetType?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

// In-memory array for session audit logs
let auditLogs: AuditEvent[] = [];

// Load initial audit logs from localStorage if available
const loadAuditLogs = (): AuditEvent[] => {
  try {
    const saved = localStorage.getItem('localshop_audit_logs');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load audit logs:', e);
  }
  return [];
};

auditLogs = loadAuditLogs();

/**
 * Log an audit event
 */
export const logAuditEvent = (event: Omit<AuditEvent, 'id' | 'timestamp' | 'ipAddress'>): AuditEvent => {
  const fullEvent: AuditEvent = {
    ...event,
    id: `audit-${Math.random().toString(36).substr(2, 9)}`,
    ipAddress: '192.168.1.1', // Mock IP Address
    timestamp: new Date().toISOString(),
  };

  auditLogs.unshift(fullEvent);

  // Keep last 500 logs in storage
  try {
    localStorage.setItem('localshop_audit_logs', JSON.stringify(auditLogs.slice(0, 500)));
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }

  // Developer logging
  console.log(`[AUDIT LOG] [${fullEvent.userRole.toUpperCase()}] ${fullEvent.userName}: ${fullEvent.details} (Action: ${fullEvent.action})`);

  return fullEvent;
};

/**
 * Retrieve current audit logs
 */
export const getAuditLogs = (): AuditEvent[] => {
  return auditLogs;
};

/**
 * Clear audit logs
 */
export const clearAuditLogs = (): void => {
  auditLogs = [];
  try {
    localStorage.removeItem('localshop_audit_logs');
  } catch (e) {
    console.error('Failed to clear audit logs:', e);
  }
};
