import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { addToast } = useNotificationStore();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!user) {
    return (
      <div className="text-center p-6">
        <p className="text-sm text-text-secondary">No active onboarding session found.</p>
        <Button className="mt-4" onClick={() => navigate('/login')}>Return to Login</Button>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      addToast({
        title: 'Validation Error',
        message: 'Please enter the verification code.',
        type: 'error',
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Import authService at the top of the file if needed, or we can just assume it is imported
      const { authService } = await import('@/features/auth/services/auth.service');
      await authService.verifyEmail(user.email, otp);
      
      setIsVerifying(false);

      addToast({
        title: 'Email Verified Successfully 🎉',
        message: 'Onboarding step 1/2 complete.',
        type: 'success',
      });

      if (user.role === 'seller' || user.role === 'rider') {
        updateUser({ status: 'under_review' });
        navigate('/auth/under-review');
      } else {
        updateUser({ status: 'active' });
        navigate('/app');
      }
    } catch (error: any) {
      setIsVerifying(false);
      addToast({
        title: 'Verification Error',
        message: error.message || 'Invalid verification code.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-2">
        <Mail size={24} />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Verify Email Address
        </h2>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          We sent a verification code to <span className="font-semibold text-text-primary">{user.email}</span>.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            6-Digit Verification Code
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary text-center font-bold tracking-widest outline-none"
          />
          <p className="text-[10px] text-text-secondary mt-1">
            Sandbox bypass code: <span className="font-semibold text-text-primary">123456</span>
          </p>
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          isLoading={isVerifying}
          icon={<CheckCircle2 size={16} />}
        >
          Confirm Verification Code
        </Button>
      </form>

      <div className="flex justify-between items-center text-xs pt-4 border-t border-border">
        <button
          onClick={() => addToast({ title: 'Code Re-sent', message: 'Check your mailbox simulator.', type: 'info' })}
          className="text-primary font-semibold hover:underline bg-transparent border-none cursor-pointer"
        >
          Resend code
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="text-text-secondary hover:text-text-primary font-semibold bg-transparent border-none cursor-pointer"
        >
          Use another account
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
