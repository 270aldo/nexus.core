// Export only what actually exists
export { default as useAuthStore } from './store/authStore';
export * from './types';

// Placeholder exports for components until they are implemented
export const LoginForm = () => null;
export const SignupForm = () => null;
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => children;
export const AuthGuard = ({ children }: { children: React.ReactNode }) => children;

// Placeholder hooks
export const useAuth = () => ({ 
  user: null, 
  isAuthenticated: false, 
  login: () => Promise.resolve(), 
  logout: () => {}, 
  loading: false 
});
export const useLogin = () => ({ 
  login: () => Promise.resolve(), 
  loading: false, 
  error: null 
});
export const useSignup = () => ({ 
  signup: () => Promise.resolve(), 
  loading: false, 
  error: null 
});