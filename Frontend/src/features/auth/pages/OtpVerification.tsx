import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVerifyOtpMutation } from '../services/auth.mutation';
import { useNotificationStore } from '@/store/notificationStore';
import { FormInput } from '@/components/form/FormFields';
import { Button } from '@/components/ui/Button';
import { Key, ArrowLeft } from 'lucide-react';

const otpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export const OtpVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useNotificationStore();
  const { mutateAsync: verifyOtpMutate, isPending } = useVerifyOtpMutation();

  const methods = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      otp: '',
    },
  });

  const onSubmit = async (values: OtpFormValues) => {
    try {
      const response = await verifyOtpMutate({
        email: values.email,
        otp: values.otp,
      });

      addToast({
        title: 'Verification Complete 🎉',
        message: `Welcome back, ${response.user.name}!`,
        type: 'success',
      });

      // Redirect based on role
      const role = response.user.role;
      if (role === 'customer') navigate('/app');
      else if (role === 'seller' || role === 'seller_staff') navigate('/seller');
      else if (role === 'rider') navigate('/rider');
      else navigate('/admin');
    } catch (err: any) {
      addToast({
        title: 'Code Rejected',
        message: err.message || 'OTP code invalid. Please try again.',
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
          Enter OTP Verification Code
        </h2>
        <p className="text-xs text-text-secondary">
          A one-time-password code has been dispatched. Input the 6-digit sandbox verification token.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="email"
            label="Email Address"
            placeholder="name@localshop.app"
            type="email"
          />

          <FormInput
            name="otp"
            label="One-Time Verification OTP"
            placeholder="123456"
            helperText="Simulation bypass code: 123456"
          />

          <Button
            type="submit"
            className="w-full justify-center py-2"
            isLoading={isPending}
            icon={<Key size={16} />}
          >
            Authenticate Profile Session
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default OtpVerification;
