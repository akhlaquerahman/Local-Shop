import { authEvents } from '@/lib/authEvents';
import { SECURITY_CONSTANTS } from '@/constants/security';

let warningTimeoutId: ReturnType<typeof setTimeout> | null = null;
let logoutTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isMonitoring = false;
let isWarningActive = false;

const resetTimer = () => {
  // Clear any active timeouts
  if (warningTimeoutId) clearTimeout(warningTimeoutId);
  if (logoutTimeoutId) clearTimeout(logoutTimeoutId);
  
  if (!isMonitoring || isWarningActive) return;

  // Set warning timeout (14 minutes, or 60 seconds before total limit)
  const warningDelay = SECURITY_CONSTANTS.SESSION_TIMEOUT_MS - 60000;
  
  warningTimeoutId = setTimeout(() => {
    triggerWarning();
  }, warningDelay > 0 ? warningDelay : 5000); // safety fallback for short test parameters
};

const triggerWarning = () => {
  isWarningActive = true;
  
  // Temporarily detach automatic activity listeners so user must explicitly click the modal to stay logged in
  detachListeners();
  
  console.warn('[Session Monitor] Inactivity warning triggered. User has 60 seconds.');
  authEvents.publish('sessionWarning');

  // Set final forced logout timeout (60 seconds)
  logoutTimeoutId = setTimeout(() => {
    console.error('[Session Monitor] Inactivity warning elapsed. Force logging out.');
    authEvents.publish('sessionExpired');
  }, 60000);
};

const handleUserActivity = () => {
  if (isMonitoring && !isWarningActive) {
    resetTimer();
  }
};

const activityEvents = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

const attachListeners = () => {
  activityEvents.forEach((event) => {
    window.addEventListener(event, handleUserActivity, { passive: true });
  });
};

const detachListeners = () => {
  activityEvents.forEach((event) => {
    window.removeEventListener(event, handleUserActivity);
  });
};

export const authSessionManager = {
  startMonitoring() {
    if (isMonitoring) return;
    isMonitoring = true;
    isWarningActive = false;
    
    attachListeners();
    resetTimer();

    console.log('[Session Monitor] Inactivity monitoring started.');
  },

  stopMonitoring() {
    isMonitoring = false;
    isWarningActive = false;
    
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
    if (logoutTimeoutId) clearTimeout(logoutTimeoutId);
    
    detachListeners();

    console.log('[Session Monitor] Inactivity monitoring stopped.');
  },

  ping() {
    // Explicitly extend the session (e.g. from the stay logged in button click)
    isWarningActive = false;
    if (isMonitoring) {
      detachListeners();
      attachListeners();
      resetTimer();
    }
    console.log('[Session Monitor] Session extended via manual ping.');
  },
};

export default authSessionManager;
