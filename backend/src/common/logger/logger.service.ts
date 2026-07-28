// ==========================================================
// Winston Logger Service
// Structured JSON logging with file rotation
// ==========================================================

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = process.env.LOG_DIR || 'logs';
    const logLevel = process.env.LOG_LEVEL || 'debug';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'fams-backend' },
      transports: [
        // Console transport (colorized for development)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const ctx = context ? `[${context}]` : '';
              const metaStr = Object.keys(meta).length > 1
                ? ` ${JSON.stringify(meta)}`
                : '';
              return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
            }),
          ),
        }),

        // Error log file with daily rotation
        new winston.transports.DailyRotateFile({
          dirname: logDir,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
        }),

        // Combined log file with daily rotation
        new winston.transports.DailyRotateFile({
          dirname: logDir,
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
