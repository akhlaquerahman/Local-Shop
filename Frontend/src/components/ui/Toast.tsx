import React from 'react';
import { useNotificationStore, ToastMessage } from '@/store/notificationStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Single Toast Alert Item
 */
export const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const { removeToast } = useNotificationStore();

  const icons = {
    success: <CheckCircle2 size={16} className="text-success" />,
    warning: <AlertTriangle size={16} className="text-warning" />,
    error: <AlertCircle size={16} className="text-danger" />,
    info: <Info size={16} className="text-accent" />,
  };

  const borderColors = {
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    error: 'border-danger/30 bg-danger/5',
    info: 'border-accent/30 bg-accent/5',
  };

  return (
    <div 
      className={`flex items-start gap-3 p-3.5 border rounded-lg shadow-enterprise-md bg-surface min-w-[300px] max-w-sm animate-in slide-in-from-right duration-200 ${borderColors[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      
      <div className="flex-1 text-left space-y-0.5">
        {toast.title && <div className="text-xs font-bold text-text-primary">{toast.title}</div>}
        <div className="text-[11px] text-text-secondary leading-normal">{toast.message}</div>
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        className="text-text-secondary hover:text-text-primary p-0.5 rounded transition-colors"
        aria-label="Close alert"
      >
        <X size={12} />
      </button>
    </div>
  );
};

/**
 * Portal container for floating toast notifications
 */
export const ToastContainer: React.FC = () => {
  const { toasts } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none select-none">
      <div className="pointer-events-auto flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
