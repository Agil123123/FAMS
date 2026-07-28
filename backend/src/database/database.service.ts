// ==========================================================
// Database Service (Prisma Client Wrapper)
// Implements: soft-delete middleware, audit columns, logging
// ==========================================================

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: LoggerService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.setupMiddleware();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected', 'DatabaseService');

    // Query logging in development
    if (process.env.NODE_ENV === 'development') {
      (this as any).$on('query', (event: any) => {
        this.logger.debug(
          `Query: ${event.query} | Duration: ${event.duration}ms`,
          'DatabaseService',
        );
      });
    }

    (this as any).$on('error', (event: any) => {
      this.logger.error(event.message, undefined, 'DatabaseService');
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected', 'DatabaseService');
  }

  /**
   * Soft-delete middleware: intercepts delete operations and
   * converts them to updates setting deleted_at timestamp.
   * Also filters out soft-deleted records from queries by default.
   */
  private setupMiddleware() {
    // Soft-delete: convert delete to update
    this.$use(async (params: any, next: any) => {
      const modelsWithSoftDelete = ['User', 'Role'];

      if (modelsWithSoftDelete.includes(params.model || '')) {
        // Intercept delete
        if (params.action === 'delete') {
          params.action = 'update';
          params.args['data'] = { deleted_at: new Date() };
        }

        // Intercept deleteMany
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data['deleted_at'] = new Date();
          } else {
            params.args['data'] = { deleted_at: new Date() };
          }
        }

        // Filter out soft-deleted records on find operations
        if (params.action === 'findFirst' || params.action === 'findMany') {
          if (!params.args) {
            params.args = {};
          }
          if (params.args.where) {
            if (params.args.where.deleted_at === undefined) {
              params.args.where['deleted_at'] = null;
            }
          } else {
            params.args['where'] = { deleted_at: null };
          }
        }

        // Filter on findUnique - convert to findFirst
        if (params.action === 'findUnique') {
          if (params.args.where.deleted_at === undefined) {
            params.action = 'findFirst';
            const where = params.args.where;
            params.args.where = { ...where, deleted_at: null };
          }
        }
      }

      return next(params);
    });
  }

  /**
   * Execute operations within a transaction
   */
  async executeInTransaction<T>(
    fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(fn);
  }
}
