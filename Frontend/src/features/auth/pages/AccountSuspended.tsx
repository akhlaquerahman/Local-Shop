import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, AlertOctagon } from 'lucide-react';

export const AccountSuspended: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-danger/10 text-danger mb-2">
        <AlertOctagon size={24} />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Account Suspended
        </h2>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          Access has been restricted for user: <span className="font-semibold text-text-primary">{user?.email}</span>.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 text-left space-y-2 text-xs text-text-secondary leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-text-primary mb-1">
          <ShieldAlert size={14} className="text-danger" />
          <span>Security & Compliance Block</span>
        </div>
        <p>
          This dashboard block was automatically triggered due to one of the following operations:
        </p>
        <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px]">
          <li>Multiple failed OTP validation entry attempts</li>
          <li>Breaching geofencing dispatch delivery coordinates SLA terms</li>
          <li>Unpaid platform commission invoices</li>
          <li>Suspicious login events detected by the fraud module</li>
        </ul>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <p className="text-xs text-text-secondary">
          If you believe this is a system configuration error, please reach out to <span className="font-semibold text-text-primary">compliance@localshop.app</span>.
        </p>
        
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-center text-xs"
        >
          Sign Out of Profile
        </Button>
      </div>
    </div>
  );
};

export default AccountSuspended;
