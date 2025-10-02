import { createLogger, format, transports } from 'winston';
import { ILogger } from '../../domain/interfaces/ILogger';

export class Logger implements ILogger {
  private logger: any;

  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        new transports.File({
          filename: 'error.log',
          level: 'error'
        }),
        new transports.File({
          filename: 'combined.log'
        })
      ]
    });
  }

  info(message: string, context?: Record<string, any>): void {
    this.logger.info(message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(message, context);
  }

  error(message: string, error?: Error | string, context?: Record<string, any>): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    this.logger.error(message, { error: errorMessage, stack: errorStack, ...context });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(message, context);
  }
}