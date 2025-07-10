import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthResponse } from '../types';
import { apiClient } from '../../../shared/services';

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post<AuthResponse>('/auth/login', {
            email,
            password,
          });

          if (response.success && response.data) {
            const { user, token, refreshToken } = response.data;
            
            apiClient.setAuthToken(token);
            localStorage.setItem('refresh_token', refreshToken);
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || 'Login failed',
            });
            return false;
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Network error',
          });
          return false;
        }
      },

      logout: () => {
        apiClient.removeAuthToken();
        localStorage.removeItem('refresh_token');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post<AuthResponse>('/auth/signup', {
            name,
            email,
            password,
          });

          if (response.success && response.data) {
            const { user, token, refreshToken } = response.data;
            
            apiClient.setAuthToken(token);
            localStorage.setItem('refresh_token', refreshToken);
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || 'Signup failed',
            });
            return false;
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Network error',
          });
          return false;
        }
      },

      refreshToken: async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return false;

        try {
          const response = await apiClient.post<AuthResponse>('/auth/refresh', {
            refreshToken,
          });

          if (response.success && response.data) {
            const { user, token } = response.data;
            
            apiClient.setAuthToken(token);
            
            set({
              user,
              token,
              isAuthenticated: true,
            });
            
            return true;
          }
        } catch (error) {
          get().logout();
        }
        
        return false;
      },

      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'nexus-core-auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;