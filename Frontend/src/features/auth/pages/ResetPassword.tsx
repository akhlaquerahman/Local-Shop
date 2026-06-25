import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPasswordMutation } from '../services/auth.mutation';
import { useNotificationStore } from '@/store/notificationStore';
import { FormInput } from '@/components/form/FormFields';
import { Button } from '@/components/ui/Button';
import { Save, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useNotificationStore();
  const { mutateAsync: resetPasswordMutate, isPending } = useResetPasswordMutation();

  const methods = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await resetPasswordMutate({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      addToast({
        title: 'Password Restored 🔑',
        message: 'You can now sign in with your new credential passcode.',
        type: 'success',
      });

      navigate('/login');
    } catch (err: any) {
      addToast({
        title: 'Reset Failed',
        message: err.message || 'OTP check failed. Verify and retype.',
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
          Cancel Recovery
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Configure New Password
        </h2>
        <p className="text-xs text-text-secondary">
          Input the 6-digit verification code sent to your account along with your new password details.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="email"
            label="Recovery Email Address"
            placeholder="name@localshop.app"
            type="email"
          />

          <FormInput
            name="otp"
            label="6-Digit Verification Code"
            placeholder="123456"
            helperText="Type sandbox bypass code: 123456"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="newPassword"
              label="New Password"
              placeholder="••••••••"
              type="password"
            />
            <FormInput
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              type="password"
            />
          </div>

          <Button
            type="submit"
            className="w-full justify-center py-2"
            isLoading={isPending}
            icon={<Save size={16} />}
          >
            Save Password & Sign In
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default ResetPassword;
