import mongoose, { Schema } from 'mongoose';
import { IBaseDocument, BaseSchemaFields } from '../../../shared/base/base.model';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PENDING_KYC = 'PENDING_KYC',
  SUSPENDED = 'SUSPENDED'
}

export interface IUsers extends IBaseDocument {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  // Role-specific fields
  referralCode?: string;
  shopName?: string;
  businessType?: string;
  gstNumber?: string;
  vehicleType?: string;
}

const schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  status: { type: String, enum: Object.values(UserStatus), required: true },
  isVerified: { type: Boolean, default: false },
  
  // Role-specific optional fields
  referralCode: { type: String },
  shopName: { type: String },
  businessType: { type: String },
  gstNumber: { type: String },
  vehicleType: { type: String },
  
  ...BaseSchemaFields
}, { timestamps: true });

// Exclude password from responses
schema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UsersModel = mongoose.model<IUsers>('Users', schema);
