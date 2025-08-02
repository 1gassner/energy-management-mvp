/**
 * Professional Logging Service for Energy Management MVP
 * 
 * Features:
 * - Environment-based log level control
 * - Structured logging for production
 * - Type-safe with TypeScript
 * - Consistent interface with native console
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStructured: boolean;
  environment: 'development' | 'production' | 'test';
}

class Logger {
  private config: LoggerConfig;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor() {
    this.config = this.getConfig();
  }

  private getConfig(): LoggerConfig {
    const env = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';
    const isDevelopment = env === 'development';
    
    return {
      level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || (isDevelopment ? 'debug' : 'warn'),
      enableConsole: isDevelopment || import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true',
      enableStructured: !isDevelopment || import.meta.env.VITE_ENABLE_STRUCTURED_LOGS === 'true',
      environment: env as 'development' | 'production' | 'test'
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.config.level];
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    };
  }

  private formatForConsole(entry: LogEntry): unknown[] {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString('de-DE');
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;
    
    const args: unknown[] = [prefix, entry.message];
    
    if (entry.context) {
      args.push(entry.context);
    }
    
    if (entry.error) {
      args.push(entry.error);
    }
    
    return args;
  }

  private formatStructured(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack
      } : undefined
    });
  }

  private writeLog(level: LogLevel, message: string, contextOrError?: Record<string, unknown> | Error, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    let context: Record<string, unknown> | undefined;
    let actualError: Error | undefined;

    // Handle overloaded parameters
    if (contextOrError instanceof Error) {
      actualError = contextOrError;
    } else {
      context = contextOrError;
      actualError = error;
    }

    const entry = this.createLogEntry(level, message, context, actualError);

    // Console output
    if (this.config.enableConsole) {
      const consoleArgs = this.formatForConsole(entry);
      
      switch (level) {
        case 'debug':
          if (this.config.environment === 'development') {
            // eslint-disable-next-line no-console
            console.debug(...consoleArgs);
          }
          break;
        case 'info':
          if (this.config.environment === 'development') {
            // eslint-disable-next-line no-console
            console.info(...consoleArgs);
          }
          break;
        case 'warn':
          if (this.config.environment === 'development') {
            // eslint-disable-next-line no-console
            console.warn(...consoleArgs);
          }
          break;
        case 'error':
          if (this.config.environment === 'development') {
            // eslint-disable-next-line no-console
            console.error(...consoleArgs);
          }
          break;
      }
    }

    // Structured output for log aggregation services
    if (this.config.enableStructured && this.config.environment === 'production') {
      const structuredLog = this.formatStructured(entry);
      
      // In production, you would send this to your logging service
      // e.g., Sentry, LogRocket, Datadog, etc.
      if (import.meta.env.VITE_LOG_ENDPOINT) {
        this.sendToLoggingService(structuredLog);
      }
    }
  }

  private async sendToLoggingService(logEntry: string): Promise<void> {
    try {
      // Example implementation for external logging service
      const endpoint = import.meta.env.VITE_LOG_ENDPOINT;
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: logEntry,
        });
      }
    } catch (error) {
      // Fallback to console if logging service fails
      if (this.config.environment === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to send log to external service:', error);
      }
    }
  }

  /**
   * Log debug information (only shown in development by default)
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.writeLog('debug', message, context);
  }

  /**
   * Log general information
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.writeLog('info', message, context);
  }

  /**
   * Log warnings
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.writeLog('warn', message, context);
  }

  /**
   * Log errors
   */
  public error(message: string, error?: Error): void;
  public error(message: string, context?: Record<string, unknown>, error?: Error): void;
  public error(message: string, contextOrError?: Record<string, unknown> | Error, error?: Error): void {
    this.writeLog('error', message, contextOrError, error);
  }

  /**
   * Create a child logger with additional context
   */
  public child(context: Record<string, unknown>): Logger {
    const childLogger = Object.create(this);
    const originalWriteLog = this.writeLog.bind(this);
    
    childLogger.writeLog = (level: LogLevel, message: string, childContext?: Record<string, unknown> | Error, error?: Error) => {
      const mergedContext = childContext instanceof Error ? context : { ...context, ...childContext };
      const actualError = childContext instanceof Error ? childContext : error;
      originalWriteLog(level, message, mergedContext, actualError);
    };
    
    return childLogger;
  }

  /**
   * Update logger configuration
   */
  public configure(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): LoggerConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory for creating child loggers
export const createLogger = (context: Record<string, unknown>) => logger.child(context);

// Export class for advanced usage
export { Logger };

// Default export for convenience
export default logger;