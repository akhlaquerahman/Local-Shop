import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { FileClock, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';

export const UnderReview: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { addToast } = useNotificationStore();
  const [isApproving, setIsApproving] = useState(false);

  if (!user) {
    return (
      <div className="text-center p-6">
        <p className="text-sm text-text-secondary">No active session found.</p>
        <Button className="mt-4" onClick={() => navigate('/login')}>Return to Login</Button>
      </div>
    );
  }

  const handleAdminBypass = async () => {
    setIsApproving(true);
    try {
      const { authService } = await import('@/features/auth/services/auth.service');
      await authService.approveSandbox(user.email);

      setIsApproving(false);
      updateUser({ status: 'active' });

      addToast({
        title: 'KYC Verification Approved 🎉',
        message: 'Your merchant profile is active. Welcome to Seller Center!',
        type: 'success',
      });

      navigate('/seller');
    } catch (error: any) {
      setIsApproving(false);
      addToast({
        title: 'Approval Error',
        message: error.message || 'Failed to approve account.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 text-warning mb-2 animate-pulse">
        <FileClock size={24} />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          KYC Documents Under Review
        </h2>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          Thanks for registering, <span className="font-semibold text-text-primary">{user.name}</span>! Our compliance team is verifying your hyperlocal operating certificates.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 text-left space-y-3">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Compliance Checklist
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <CheckSquare size={14} className="text-success" />
            <span>Onboarding representatives verification</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <CheckSquare size={14} className="text-success" />
            <span>Email check confirmation</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <div className="w-3.5 h-3.5 rounded border border-warning flex items-center justify-center text-[10px] text-warning font-bold">
              •
            </div>
            <span>PAN bank wire ledger confirmation (Pending)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <div className="w-3.5 h-3.5 rounded border border-warning flex items-center justify-center text-[10px] text-warning font-bold">
              •
            </div>
            <span>Hyperlocal coordinate geofencing review (Pending)</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        {/* Sandbox Admin approval bypass */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-left space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles size={14} />
            <span>Sandbox Simulator Controls</span>
          </div>
          <p className="text-[10px] text-text-secondary">
            Bypass standard SLA document review timelines and approve this shop credentials immediately.
          </p>
          <Button
            size="sm"
            onClick={handleAdminBypass}
            isLoading={isApproving}
            className="w-full justify-center text-xs"
          >
            Approve Merchant Shop
          </Button>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="text-xs font-semibold text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default UnderReview;
