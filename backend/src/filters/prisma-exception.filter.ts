// ==========================================================
// Prisma Exception Filter
// Maps Prisma error codes to HTTP status codes
// ==========================================================

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { LoggerService } from '../common/logger/logger.service';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    switch (exception.code) {
      // Unique constraint violation
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const fields = (exception.meta?.target as string[]) || [];
        message = `Duplicate value for field(s): ${fields.join(', ')}`;
        break;
      }

      // Record not found
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;

      // Foreign key constraint violation
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        const field = exception.meta?.field_name as string;
        message = `Foreign key constraint failed on field: ${field}`;
        break;
      }

      // Required relation violation
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Required relation violation';
        break;

      // Related record required
      case 'P2018':
        status = HttpStatus.BAD_REQUEST;
        message = 'Related record not found';
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database error occurred';
    }

    this.logger.error(
      `Prisma error ${exception.code}: ${exception.message}`,
      exception.stack,
      'PrismaExceptionFilter',
    );

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
