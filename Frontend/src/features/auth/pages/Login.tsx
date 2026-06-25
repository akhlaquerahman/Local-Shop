import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '../services/auth.mutation';
import { useNotificationStore } from '@/store/notificationStore';
import { FormInput } from '@/components/form/FormFields';
import { Button } from '@/components/ui/Button';
import { ShieldCheck } from 'lucide-react';
import { authStorage } from '../services/auth.storage';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useNotificationStore();
  const { mutateAsync: loginMutate, isPending } = useLoginMutation();

  const savedEmail = authStorage.getRememberMe();

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: savedEmail || '',
      password: '',
      rememberMe: !!savedEmail,
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await loginMutate({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      addToast({
        title: 'Welcome Back!',
        message: `Authenticated as ${response.user.name} (${response.user.role})`,
        type: 'success',
      });

      // Redirect depending on user role and onboarding status
      const role = response.user.role;
      if (response.user.status === 'PENDING_VERIFICATION' || response.user.status === 'PENDING_KYC') {
        navigate('/auth/under-review');
      } else if (role === 'customer') {
        navigate('/app');
      } else if (role === 'seller') {
        navigate('/seller');
      } else if (role === 'rider') {
        navigate('/rider');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      addToast({
        title: 'Login Error',
        message: err.message || 'Verification failed. Try again.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-2">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Sign in to Platform</h2>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          Enter your registered credentials to access your dashboard.
        </p>
      </div>

      {searchParams.get('reason') === 'session_expired' && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger font-medium text-left">
          Your session expired due to inactivity. Please sign in again.
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <FormInput
            name="email"
            label="Email Address"
            placeholder="name@localshop.app"
            type="email"
          />

          <FormInput
            name="password"
            label="Password"
            placeholder="••••••••"
            type="password"
          />

          <div className="flex items-center justify-between text-left">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...methods.register('rememberMe')}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-background"
              />
              <span className="text-xs text-text-secondary">Remember my session</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full justify-center py-2"
            isLoading={isPending}
            icon={<ShieldCheck size={16} />}
          >
            Sign In to Dashboard
          </Button>
        </form>
      </FormProvider>

      <div className="text-center pt-2 space-y-2">
        <p className="text-xs text-text-secondary">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-semibold text-primary hover:underline">
            Register now
          </Link>
        </p>
        <p className="text-xs text-text-secondary">
          Are you a staff member?{' '}
          <Link to="/staff/login" className="font-semibold text-accent hover:underline">
            Staff Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
