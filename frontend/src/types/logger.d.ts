/**
 * Type definitions for the logger module
 */

declare module '../utils/logger' {
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

  export class Logger {
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error): void;
    error(message: string, context?: Record<string, unknown>, error?: Error): void;
    child(context: Record<string, unknown>): Logger;
    configure(newConfig: Partial<LoggerConfig>): void;
    getConfiguration(): LoggerConfig;
  }

  export const logger: Logger;
  export const createLogger: (context: Record<string, unknown>) => Logger;
  export default logger;
}