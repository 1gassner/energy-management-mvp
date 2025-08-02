import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types';
import { notificationService } from '@/services/notification.service';
import { apiService } from '@/services/serviceFactory';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
  initialize: () => Promise<void>;
}


export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login(credentials);
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          notificationService.success(`Willkommen zurück, ${response.user.name}!`);
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          notificationService.error(errorMessage);
          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.register(data);
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          notificationService.success(`Willkommen ${response.user.name}! Ihr Account wurde erfolgreich erstellt.`);
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          notificationService.error(errorMessage);
          return false;
        }
      },

      logout: async () => {
        try {
          await apiService.logout();
        } catch (error) {
          // Logout should always succeed locally even if server call fails
          console.warn('Server logout failed, continuing with local logout:', error);
        } finally {
          // Remove token from localStorage
          localStorage.removeItem('auth_token');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          notificationService.info('Sie wurden erfolgreich abgemeldet');
        }
      },

      refreshUser: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
          return;
        }

        set({ isLoading: true });
        
        try {
          const user = await apiService.refreshUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Clear both localStorage and persisted state
          localStorage.removeItem('auth_token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // Don't show error on app initialization
          });
        }
      },

      initialize: async () => {
        // Initialize auth state on app startup
        const token = localStorage.getItem('auth_token');
        const persistedState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        
        if (token && persistedState.state?.user) {
          // We have both token and persisted user, try to refresh
          await get().refreshUser();
        } else {
          // Clear inconsistent state
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth-storage');
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);