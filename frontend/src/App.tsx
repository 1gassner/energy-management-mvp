import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Router from './Router';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import MockDataToggle from './components/dev/MockDataToggle';
import { useAuthStore } from './stores/authStore';
import { websocketService } from './services/websocket.service';
import { logger } from './utils/logger';

function App() {
  const { user, isAuthenticated, refreshUser } = useAuthStore();

  // Initialize user session on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await refreshUser();
      } catch (error) {
        logger.error('Failed to initialize user session', error as Error);
      }
    };

    initializeApp();
  }, [refreshUser]);

  // Manage WebSocket connection based on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect WebSocket when user is authenticated
      logger.info('User authenticated, connecting WebSocket', { userId: user?.id });
      websocketService.connect();
    } else {
      // Disconnect WebSocket when user logs out
      logger.info('User not authenticated, disconnecting WebSocket');
      websocketService.disconnect();
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
        <Layout>
          <Router />
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
}

export default App;