import { z } from 'zod';
import { UserRole } from '../../users/models/users.model';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum([UserRole.CUSTOMER, UserRole.SELLER, UserRole.DELIVERY_PARTNER]),
    
    // Conditional fields for Seller
    shopName: z.string().optional(),
    businessType: z.string().optional(),
    gstNumber: z.string().optional(),
    
    // Conditional fields for Rider
    vehicleType: z.string().optional(),
    
    // Customer
    referralCode: z.string().optional(),
  }).refine((data) => {
    if (data.role === UserRole.SELLER && !data.shopName) return false;
    return true;
  }, { message: "shopName is required for Sellers", path: ["shopName"] })
  .refine((data) => {
    if (data.role === UserRole.DELIVERY_PARTNER && !data.vehicleType) return false;
    return true;
  }, { message: "vehicleType is required for Delivery Partners", path: ["vehicleType"] })
});
