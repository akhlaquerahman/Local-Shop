import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPasswordMutation } from '../services/auth.mutation';
import { useNotificationStore } from '@/store/notificationStore';
import { FormInput } from '@/components/form/FormFields';
import { Button } from '@/components/ui/Button';
import { KeyRound, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  const { mutateAsync: sendResetLink, isPending } = useForgotPasswordMutation();

  const methods = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await sendResetLink({ email: values.email });
      
      addToast({
        title: 'OTP Code Sent 🔑',
        message: 'Sandbox verification code is 123456.',
        type: 'success',
      });
      
      // Redirect to reset password page with email context
      navigate(`/auth/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      addToast({
        title: 'Error dispatching request',
        message: err.message || 'System failed to register reset request.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-left">
      <div className="space-y-2">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-semibold text-text-secondary hover:text-text-primary gap-1"
        >
          <ArrowLeft size={12} />
          Back to Login
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Recover Password
        </h2>
        <p className="text-xs text-text-secondary">
          Enter your registered email address below, and we'll dispatch a 6-digit sandbox verification code.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="email"
            label="Email Address"
            placeholder="registered@localshop.app"
            type="email"
          />

          <Button
            type="submit"
            className="w-full justify-center py-2"
            isLoading={isPending}
            icon={<KeyRound size={16} />}
          >
            Dispatch Verification Code
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default ForgotPassword;
