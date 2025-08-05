import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      environment: import.meta.env.VITE_APP_ENV || 'production',
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            window.history
          ),
          tracingOrigins: ['localhost', /^\//],
        }),
        new CaptureConsole({
          levels: ['error', 'warn']
        })
      ],
      tracesSampleRate: import.meta.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = hint.originalException;
          // Filter out network errors that are expected
          if (error?.message?.includes('Failed to fetch')) {
            return null;
          }
        }
        return event;
      },
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        /Failed to fetch/,
        /NetworkError/,
        /Load failed/
      ]
    });
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context
    });
  } else {
    console.error('Sentry (dev):', error, context);
  }
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`Sentry (dev) [${level}]:`, message);
  }
};

export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

export const clearUser = () => {
  Sentry.setUser(null);
};