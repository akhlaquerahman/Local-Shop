import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authService } from './auth.service';
import { authStorage } from './auth.storage';
import { authSessionManager } from './auth.session';
import { 
  LoginCredentials, 
  OtpCredentials, 
  RegisterCredentials, 
  ForgotPasswordCredentials, 
  ResetPasswordCredentials 
} from './auth.types';

export const useLoginMutation = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data, variables) => {
      login(data);
      
      if (variables.rememberMe) {
        authStorage.setRememberMe(variables.email);
      } else {
        authStorage.clearRememberMe();
      }

      authSessionManager.startMonitoring();
    },
  });
};

export const useStaffLoginMutation = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.staffLogin(credentials),
    onSuccess: (data, variables) => {
      login(data);
      
      if (variables.rememberMe) {
        authStorage.setRememberMe(variables.email);
      } else {
        authStorage.clearRememberMe();
      }

      authSessionManager.startMonitoring();
    },
  });
};

export const useVerifyOtpMutation = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: OtpCredentials) => authService.verifyOtp(credentials),
    onSuccess: (data) => {
      login(data);
      authSessionManager.startMonitoring();
    },
  });
};

export const useRegisterMutation = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (data) => {
      login(data);
      authSessionManager.startMonitoring();
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (credentials: ForgotPasswordCredentials) =>
      authService.forgotPassword(credentials),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (credentials: ResetPasswordCredentials) =>
      authService.resetPassword(credentials),
  });
};

export const useLogoutMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async () => {
      const userPayload = user ? { id: user.id, name: user.name, email: user.email, role: user.role } : undefined;
      await authService.logout(userPayload);
    },
    onSuccess: () => {
      logout();
      authSessionManager.stopMonitoring();
    },
  });
};
