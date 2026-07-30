// ==========================================================
// FAMS Root Application Module
// ==========================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { QueueModule } from './common/queue/queue.module';
import { StorageModule } from './common/storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AssetsModule } from './assets/assets.module';
import { OltsModule } from './olts/olts.module';
import { OdcsModule } from './odcs/odcs.module';
import { OdpsModule } from './odps/odps.module';
import { SplittersModule } from './splitters/splitters.module';
import { FiberCoresModule } from './fiber-cores/fiber-cores.module';
import { FiberSplicesModule } from './fiber-splices/fiber-splices.module';
import { FiberTraceModule } from './fiber-trace/fiber-trace.module';
import { GisModule } from './gis/gis.module';
import { HomepassesModule } from './homepasses/homepasses.module';
import { CustomersModule } from './customers/customers.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { SystemModule } from './system/system.module';
import { AuditModule } from './audit/audit.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { configValidationSchema } from './config/config.validation';

@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),

    // Schedule & Queues
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 30,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Infrastructure modules
    DatabaseModule,
    LoggerModule,
    QueueModule,
    StorageModule,

    // Auth & access control
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    DashboardModule,
    AssetsModule,
    OltsModule,
    OdcsModule,
    OdpsModule,
    SplittersModule,
    FiberCoresModule,
    FiberSplicesModule,
    FiberTraceModule,
    GisModule,
    HomepassesModule,
    CustomersModule,
    WorkOrdersModule,
    ReportsModule,
    NotificationsModule,
    AiModule,
    SystemModule,
    AuditModule,
  ],
  providers: [
    // Global JWT guard - all routes require auth by default
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global RBAC guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global rate limiter
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
