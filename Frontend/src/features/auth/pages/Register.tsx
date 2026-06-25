import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '../services/auth.mutation';
import { useNotificationStore } from '@/store/notificationStore';
import { FormInput, FormSelect } from '@/components/form/FormFields';
import { Button } from '@/components/ui/Button';
import { UserPlus, ArrowLeft } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number (10+ digits)'),
  role: z.enum(['CUSTOMER', 'SELLER', 'DELIVERY_PARTNER']),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  
  // Dynamic optional fields
  referralCode: z.string().optional(),
  shopName: z.string().optional(),
  businessType: z.string().optional(),
  gstNumber: z.string().optional(),
  vehicleType: z.string().optional(),

  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the operating terms' }),
  }),
}).refine(data => {
  if (data.role === 'SELLER' && !data.shopName) return false;
  return true;
}, { message: 'Shop Name is required for Sellers', path: ['shopName'] })
.refine(data => {
  if (data.role === 'DELIVERY_PARTNER' && !data.vehicleType) return false;
  return true;
}, { message: 'Vehicle Type is required for Delivery Partners', path: ['vehicleType'] });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  const { mutateAsync: registerMutate, isPending } = useRegisterMutation();

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'CUSTOMER',
      password: '',
      referralCode: '',
      shopName: '',
      businessType: 'Retail',
      gstNumber: '',
      vehicleType: 'Bike',
      agreeToTerms: true,
    },
  });

  const selectedRole = methods.watch('role');

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await registerMutate({
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        password: values.password,
        referralCode: values.referralCode,
        shopName: values.shopName,
        businessType: values.businessType,
        gstNumber: values.gstNumber,
        vehicleType: values.vehicleType,
      });

      addToast({
        title: 'Account Registered 🎉',
        message: 'Your account has been created successfully.',
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
        title: 'Registration Failed',
        message: err.message || 'Validation error. Please verify input data.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-semibold text-text-secondary hover:text-text-primary gap-1"
        >
          <ArrowLeft size={12} />
          Back to Login
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary text-left">
          Join Local Shop
        </h2>
        <p className="text-xs text-text-secondary text-left">
          Create your account and select your role to get started.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 text-left">
          
          <FormSelect
            name="role"
            label="Account Type"
            options={[
              { label: 'Customer', value: 'CUSTOMER' },
              { label: 'Seller (Merchant)', value: 'SELLER' },
              { label: 'Delivery Partner (Rider)', value: 'DELIVERY_PARTNER' },
            ]}
          />

          <FormInput name="name" label="Full Name" placeholder="John Doe" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="email" label="Email Address" placeholder="hello@example.com" type="email" />
            <FormInput name="phone" label="Mobile Number" placeholder="+91 98765 43210" />
          </div>

          <FormInput name="password" label="Secure Password" placeholder="••••••••" type="password" />

          {/* DYNAMIC FIELDS BASED ON ROLE */}
          {selectedRole === 'CUSTOMER' && (
            <FormInput name="referralCode" label="Referral Code (Optional)" placeholder="e.g. SAVE50" />
          )}

          {selectedRole === 'SELLER' && (
            <div className="space-y-4 p-4 border border-border rounded-lg bg-background-alt">
              <h4 className="text-sm font-semibold">Seller Details</h4>
              <FormInput name="shopName" label="Shop Name" placeholder="My Local Mart" />
              <FormSelect 
                name="businessType" 
                label="Business Type" 
                options={[
                  { label: 'Retail', value: 'Retail' },
                  { label: 'Grocery', value: 'Grocery' },
                  { label: 'Pharmacy', value: 'Pharmacy' },
                  { label: 'Electronics', value: 'Electronics' }
                ]}
              />
              <FormInput name="gstNumber" label="GST Number (Optional)" placeholder="22AAAAA0000A1Z5" />
            </div>
          )}

          {selectedRole === 'DELIVERY_PARTNER' && (
            <div className="space-y-4 p-4 border border-border rounded-lg bg-background-alt">
              <h4 className="text-sm font-semibold">Vehicle Details</h4>
              <FormSelect 
                name="vehicleType" 
                label="Vehicle Type" 
                options={[
                  { label: 'Bike', value: 'Bike' },
                  { label: 'Scooter', value: 'Scooter' },
                  { label: 'Cycle', value: 'Cycle' },
                  { label: 'EV', value: 'EV' }
                ]}
              />
            </div>
          )}

          <label className="flex items-start space-x-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              {...methods.register('agreeToTerms')}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-background mt-0.5"
            />
            <span className="text-xs text-text-secondary leading-normal">
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>
          {methods.formState.errors.agreeToTerms && (
            <p className="text-[10px] text-danger mt-1">
              {methods.formState.errors.agreeToTerms.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full justify-center py-2"
            isLoading={isPending}
            icon={<UserPlus size={16} />}
          >
            Create Account
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default Register;
