// ==========================================================
// Global HTTP Exception Filter
// Standardized error response format per API contract
// ==========================================================

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../common/logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error details
    let message = 'Internal Server Error';
    let errors: string[] = [];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as Record<string, unknown>;
      message = (resp.message as string) || exception.message;

      // Handle class-validator errors
      if (Array.isArray(resp.message)) {
        errors = resp.message as string[];
        message = 'Validation failed';
      }
    }

    const errorResponse = {
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${message}`,
        exception.stack,
        'HttpExceptionFilter',
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${message}`,
        'HttpExceptionFilter',
      );
    }

    response.status(status).json(errorResponse);
  }
}
