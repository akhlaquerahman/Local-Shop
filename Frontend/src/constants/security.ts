/**
 * Enterprise Security Configuration Constants
 */
export const SECURITY_CONSTANTS = {
  // Session Inactive timeout limit (7 days in milliseconds)
  SESSION_TIMEOUT_MS: 7 * 24 * 60 * 60 * 1000,

  // Token pre-emptive refresh interval buffer (5 minutes in milliseconds)
  REFRESH_BUFFER_MS: 5 * 60 * 1000,

  // Axios request retry threshold
  MAX_RETRY_REQUESTS: 3,

  // LocalStorage keys mapping
  STORAGE_KEYS: {
    SESSION: 'localshop_session',
    THEME: 'localshop_theme',
    AUDIT_LOGS: 'localshop_audit_logs',
    REMEMBER_ME: 'localshop_remember_me',
  },
} as const;
