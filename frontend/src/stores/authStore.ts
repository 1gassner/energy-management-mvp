import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types';
import { notificationService } from '@/services/notification.service';
import { secureAPIService } from '@/services/api/secureApiService';
import { securityService } from '@/services/securityService';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
  initialize: () => Promise<void>;
  
  // Internal state for race condition prevention
  _isInitializing: boolean;
  _initializePromise: Promise<void> | null;
}


export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Internal state
      _isInitializing: false,
      _initializePromise: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        const currentState = get();
        
        // Prevent multiple simultaneous login attempts
        if (currentState.isLoading) {
          return false;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Optimistic update - clear any existing error immediately
          set(state => ({ ...state, error: null }));
          
          // Use secure API service - token is now stored in httpOnly cookie
          const response = await secureAPIService.login(credentials);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          notificationService.success(`Willkommen zurück, ${response.user.name}!`);
          return true;
        } catch (error) {
          const errorMessage = securityService.getSecureErrorMessage(error instanceof Error ? error : 'Anmeldung fehlgeschlagen');
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
        const currentState = get();
        
        // Prevent multiple simultaneous registration attempts
        if (currentState.isLoading) {
          return false;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Optimistic update - clear any existing error immediately
          set(state => ({ ...state, error: null }));
          
          // Use secure API service - token is now stored in httpOnly cookie
          const response = await secureAPIService.register(data);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          notificationService.success(`Willkommen ${response.user.name}! Ihr Account wurde erfolgreich erstellt.`);
          return true;
        } catch (error) {
          const errorMessage = securityService.getSecureErrorMessage(error instanceof Error ? error : 'Registrierung fehlgeschlagen');
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
          await secureAPIService.logout();
        } catch (error) {
          // Logout should always succeed locally even if server call fails
          console.warn('Server logout failed, continuing with local logout:', error);
        } finally {
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
        const currentState = get();
        
        // Prevent multiple simultaneous refresh calls
        if (currentState.isLoading || currentState._isInitializing) {
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const user = await secureAPIService.refreshUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Session expired or invalid - clear state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // Don't show error on app initialization
          });
        }
      },

      initialize: async () => {
        const currentState = get();
        
        // Prevent multiple simultaneous initialization calls
        if (currentState._isInitializing || currentState._initializePromise) {
          return currentState._initializePromise || Promise.resolve();
        }
        
        // Create and store initialization promise to prevent race conditions
        const initPromise = (async () => {
          set({ _isInitializing: true });
          
          try {
            // Initialize auth state on app startup
            // With httpOnly cookies, we just try to refresh user data
            await get().refreshUser();
          } finally {
            set({ _isInitializing: false, _initializePromise: null });
          }
        })();
        
        set({ _initializePromise: initPromise });
        return initPromise;
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
        // Don't persist internal state to prevent stale race condition flags
      }),
    }
  )
);