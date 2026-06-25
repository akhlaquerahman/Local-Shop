import apiClient from '@/lib/apiClient';
import { 
  LoginCredentials, 
  OtpCredentials, 
  RegisterCredentials, 
  AuthResponse,
  ForgotPasswordCredentials,
  ResetPasswordCredentials
} from './auth.types';
import { auditService } from '@/services/audit/audit.service';
import { authEvents } from '@/lib/authEvents';

const mapRole = (backendRole: string): string => {
  if (backendRole === 'SUPER_ADMIN') return 'admin';
  if (backendRole === 'DELIVERY_PARTNER') return 'rider';
  if (backendRole) return backendRole.toLowerCase();
  return 'customer';
};

const mapStatus = (backendStatus: string): string => {
  if (!backendStatus) return 'active';
  return backendStatus.toLowerCase();
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      const userPayload = response.data.user || response.data.data?.user || response.data.data;
      const tokenPayload = response.data.token || response.data.data?.token || response.data.accessToken || response.data.data?.accessToken;
      const refreshTokenPayload = response.data.refreshToken || response.data.data?.refreshToken;

      const authData: AuthResponse = {
        token: tokenPayload,
        refreshToken: refreshTokenPayload,
        user: {
          id: userPayload._id || userPayload.id,
          name: userPayload.name,
          email: userPayload.email,
          role: mapRole(userPayload.role) as any,
          phone: userPayload.phone,
          avatarUrl: userPayload.avatarUrl || '',
          status: mapStatus(userPayload.status),
          createdAt: userPayload.createdAt,
          accountType: userPayload.role === 'SELLER' ? 'SELLER_OWNER' : userPayload.accountType,
          isAgent: userPayload.isAgent,
          permissions: userPayload.permissions || [],
          effectivePermissions: userPayload.effectivePermissions || []
        } as any,
      };

      auditService.logSecurityEvent('LOGIN', authData.user, { rememberMe: !!credentials.rememberMe });
      authEvents.publish('login', authData);
      
      return authData;
    } catch (error: any) {
      console.error("Login Error:", error);
      throw new Error(error.response?.data?.message || 'Login failed. Please verify your credentials.');
    }
  },

  async staffLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/staff/login', {
        email: credentials.email,
        password: credentials.password
      });

      const userPayload = response.data.user || response.data.data?.user || response.data.data;
      const tokenPayload = response.data.token || response.data.data?.token || response.data.accessToken || response.data.data?.accessToken;
      const refreshTokenPayload = response.data.refreshToken || response.data.data?.refreshToken;

      const authData: AuthResponse = {
        token: tokenPayload,
        refreshToken: refreshTokenPayload,
        user: {
          id: userPayload._id || userPayload.id,
          name: userPayload.fullName,
          email: userPayload.email,
          role: 'seller_staff' as any,
          phone: userPayload.phone,
          avatarUrl: userPayload.profileImage || '',
          status: mapStatus(userPayload.status),
          createdAt: userPayload.createdAt,
          accountType: 'SELLER_STAFF',
          isStaff: true,
          staffRole: userPayload.role,
          employeeCode: userPayload.employeeCode,
          permissions: userPayload.permissions || [],
          effectivePermissions: userPayload.effectivePermissions || []
        } as any,
      };

      auditService.logSecurityEvent('LOGIN', authData.user, { rememberMe: !!credentials.rememberMe });
      authEvents.publish('login', authData);
      
      return authData;
    } catch (error: any) {
      console.error("Staff Login Error:", error);
      throw new Error(error.response?.data?.message || 'Login failed. Please verify your credentials.');
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', credentials);
      
      const userPayload = response.data.user || response.data.data?.user || response.data.data;
      const tokenPayload = response.data.token || response.data.data?.token || response.data.accessToken || response.data.data?.accessToken;
      const refreshTokenPayload = response.data.refreshToken || response.data.data?.refreshToken;

      const authData: AuthResponse = {
        token: tokenPayload,
        refreshToken: refreshTokenPayload,
        user: {
          id: userPayload._id || userPayload.id,
          name: userPayload.name,
          email: userPayload.email,
          role: mapRole(userPayload.role) as any,
          phone: userPayload.phone,
          avatarUrl: userPayload.avatarUrl || '',
          status: userPayload.status,
          createdAt: userPayload.createdAt,
        },
      };

      auditService.logSecurityEvent('LOGIN', authData.user, { action: 'register' });
      authEvents.publish('login', authData);
      
      return authData;
    } catch (error: any) {
      console.error("Registration Error:", error);
      throw new Error(error.response?.data?.message || 'Registration failed. Check inputs.');
    }
  },

  async getMe(): Promise<AuthResponse['user']> {
    try {
      const response = await apiClient.get('/auth/me');
      const data = response.data.user || response.data.data?.user || response.data.data;
      return {
        id: data._id || data.id,
        name: data.name || data.fullName,
        email: data.email,
        role: data.isStaff ? 'seller_staff' : mapRole(data.role),
        phone: data.phone,
        avatarUrl: data.avatarUrl || data.profileImage || '',
        status: mapStatus(data.status),
        createdAt: data.createdAt,
        accountType: data.accountType,
        isStaff: data.isStaff,
        isAgent: data.isAgent,
        staffRole: data.isStaff ? data.role : undefined,
        permissions: data.permissions || [],
        effectivePermissions: data.effectivePermissions || [],
      } as any;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile.');
    }
  },

  async logout(user?: { id: string; name: string; email: string; role: string }): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore errors on logout
    }
    if (user) auditService.logSecurityEvent('LOGOUT', user);
    authEvents.publish('logout');
  },

  // Mocked for now since email OTP APIs aren't fully established yet
  async verifyOtp(credentials: OtpCredentials): Promise<AuthResponse> {
    throw new Error('OTP verification is currently unsupported on the backend.');
  },
  async forgotPassword(credentials: ForgotPasswordCredentials): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email: credentials.email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request password reset.');
    }
  },
  async resetPassword(credentials: ResetPasswordCredentials): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { 
        email: credentials.email,
        otp: credentials.otp,
        newPassword: credentials.newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password.');
    }
  },

  async verifyEmail(email: string, otp: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { email, otp });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify email.');
    }
  },

  async approveSandbox(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/approve-sandbox', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve account.');
    }
  }
};

export default authService;
