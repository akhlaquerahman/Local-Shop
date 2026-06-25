import bcrypt from 'bcrypt';
import jwt from 'jwt-simple'; // We'll use jsonwebtoken, wait, let me just use jsonwebtoken
import * as jwtWebToken from 'jsonwebtoken';
import { UsersModel, UserRole, UserStatus } from '../../users/models/users.model';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
  private readonly REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'supersecretrefresh';

  async register(data: any) {
    const { name, email, phone, password, role, shopName, businessType, gstNumber, vehicleType, referralCode } = data;

    // Reject SUPER_ADMIN registration completely
    if (role === UserRole.SUPER_ADMIN) {
      throw new Error('Registration as Super Admin is forbidden.');
    }

    // Check unique
    const existing = await UsersModel.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      throw new Error('User with this email or phone already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine initial status based on role
    let status = UserStatus.ACTIVE;
    if (role === UserRole.SELLER) status = UserStatus.PENDING_VERIFICATION;
    if (role === UserRole.DELIVERY_PARTNER) status = UserStatus.PENDING_KYC;

    const user = await UsersModel.create({
      name, email, phone, password: hashedPassword, role, status,
      shopName, businessType, gstNumber, vehicleType, referralCode
    });

    return user;
  }

  async login(email: string, pass: string) {
    const user = await UsersModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(pass, user.password!);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new Error('Account suspended. Please contact support.');
    }

    const payload = { id: user._id, role: user.role, status: user.status };
    const accessToken = jwtWebToken.sign(payload, this.JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwtWebToken.sign(payload, this.REFRESH_SECRET, { expiresIn: '7d' });

    return { user, accessToken, refreshToken };
  }
}
