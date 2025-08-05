import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import * as Sentry from '@sentry/react';
import Router from './Router';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import MockDataToggle from './components/dev/MockDataToggle';
import SkipNavigation from './components/accessibility/SkipNavigation';
import { useAuthStore } from './stores/authStore';
import { websocketService } from './services/websocket.service';
import { logger } from './utils/logger';
import { initSentry, setUser, clearUser } from './utils/sentry';
import { featureFlags } from './utils/featureFlags';
import { rum } from './utils/rum';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Initialize Sentry error tracking
initSentry();

// Enhanced App with Sentry error boundaries
const EnhancedApp = Sentry.withProfiler(function App() {
  const { user, isAuthenticated, initialize } = useAuthStore();
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize user session on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize();
        
        // Auto-login for demo mode
        if (import.meta.env.VITE_DEMO_MODE === 'true' && !isAuthenticated) {
          logger.info('Demo mode: Auto-logging in as admin user');
          const { login } = useAuthStore.getState();
          await login({ email: 'admin@hechingen.de', password: 'demo123' });
        }
      } catch (error) {
        logger.error('Failed to initialize user session', error as Error);
      }
    };

    initializeApp();
  }, [initialize, isAuthenticated]);

  // Manage WebSocket connection and user tracking
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect WebSocket when user is authenticated
      logger.info('User authenticated, connecting WebSocket', { userId: user?.id });
      websocketService.connect();
      
      // Set user for Sentry error tracking
      setUser({ id: user.id, email: user.email });
      
      // Set user for feature flags
      featureFlags.setUser(user.id, user.role);
      
      // Track user login
      rum.trackUserInteraction('login', 'auth', 1);
    } else {
      // Disconnect WebSocket when user logs out
      logger.info('User not authenticated, disconnecting WebSocket');
      websocketService.disconnect();
      
      // Clear user tracking
      clearUser();
    }

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', { reason: event.reason });
      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      logger.error('Global error', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SkipNavigation />
        <Layout>
          <main id="main-content" tabIndex={-1}>
            <Router />
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                  color: '#fff',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                  color: '#fff',
                },
              },
              loading: {
                style: {
                  background: '#3B82F6',
                  color: '#fff',
                },
              },
            }}
            containerStyle={{
              top: 20,
              right: 20,
            }}
          />
          <MockDataToggle />
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
});

export default EnhancedApp;