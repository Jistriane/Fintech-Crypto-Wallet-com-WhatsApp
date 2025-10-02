export interface ILogger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error | string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
}