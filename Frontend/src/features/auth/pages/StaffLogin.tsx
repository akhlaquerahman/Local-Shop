import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStaffLoginMutation } from '../services/auth.mutation';
import { useNotificationStore } from '@/store/notificationStore';
import { FormInput } from '@/components/form/FormFields';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, UserCircle } from 'lucide-react';
import { authStorage } from '../services/auth.storage';
import { STAFF_ROLES } from '../permissions/staff.roles';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const StaffLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useNotificationStore();
  const { mutateAsync: loginMutate, isPending } = useStaffLoginMutation();

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
        message: `Authenticated as ${response.user.name} (Staff)`,
        type: 'success',
      });

      const staffRole = (response.user.permissions as any)?.role || response.user.role; // we'll need to fetch the staff's sub-role if needed, but the response user has role='seller_staff'. 
      // Actually, wait, authService staffLogin currently sets role='seller_staff'. We need to know if they are STORE_MANAGER etc.
      // Let's import STAFF_ROLES. Wait, if we don't have the exact sub-role in user object, maybe we should fetch it or pass it.
      // I'll update backend to send the sub-role as `staffRole` in the JWT payload.
      const subRole = (response.user as any).staffRole || 'STORE_MANAGER';
      const defaultRoute = STAFF_ROLES[subRole as keyof typeof STAFF_ROLES]?.defaultRoute || '/seller';

      navigate(defaultRoute);
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
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 text-accent mb-2">
          <UserCircle size={28} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Staff Portal</h2>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          Sign in with your employee credentials to access the seller dashboard.
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
    </div>
  );
};

export default StaffLogin;
