import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authEvents } from '@/lib/authEvents';
import { authSessionManager } from '../services/auth.session';
import { useLogoutMutation } from '../services/auth.mutation';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Clock } from 'lucide-react';

export const SessionWarningModal: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const { mutate: performLogout } = useLogoutMutation();

  useEffect(() => {
    // 1. Listen for session warning event
    const unsubscribeWarning = authEvents.subscribe('sessionWarning', () => {
      setTimeLeft(60);
      setIsOpen(true);
    });

    // 2. Listen for login/logout/sessionExpired events to auto close warnings
    const unsubscribeLogout = authEvents.subscribe('logout', () => {
      setIsOpen(false);
    });
    const unsubscribeExpired = authEvents.subscribe('sessionExpired', () => {
      setIsOpen(false);
    });

    return () => {
      unsubscribeWarning();
      unsubscribeLogout();
      unsubscribeExpired();
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isOpen && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && timeLeft === 0) {
      setIsOpen(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const handleExtend = () => {
    authSessionManager.ping();
    setIsOpen(false);
  };

  const handleLogout = () => {
    performLogout(undefined, {
      onSuccess: () => {
        setIsOpen(false);
        navigate('/login');
      },
    });
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const s = secs % 60;
    return `00:${s < 10 ? '0' : ''}${s}`;
  };

  const percentage = (timeLeft / 60) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-surface border border-border rounded-lg shadow-enterprise p-6 space-y-5 animate-in zoom-in-95 duration-200 text-left">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-warning/15 text-warning flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="animate-bounce" />
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="text-sm font-bold text-text-primary">Session Expiring Soon</h3>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              You have been inactive for a while. For your security, you will be automatically logged out of the Local Shop platform.
            </p>
          </div>
        </div>

        {/* Countdown Indicator */}
        <div className="space-y-2 bg-background border border-border p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Clock size={14} className="text-text-secondary" />
            <span>Time Remaining:</span>
          </div>
          <span className="font-mono text-xs font-bold text-danger animate-pulse">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Custom Progress Bar Indicator */}
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-warning transition-all duration-1000 ease-linear rounded-full" 
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex-grow justify-center py-2"
          >
            Logout
          </Button>
          <Button
            onClick={handleExtend}
            variant="primary"
            size="sm"
            className="flex-grow justify-center py-2 shadow-enterprise"
          >
            Stay Logged In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
