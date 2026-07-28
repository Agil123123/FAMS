// ==========================================================
// FAMS BullMQ Worker — Standalone entrypoint
// Only starts queue processing, no HTTP server
// ==========================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  logger.log('🐂 BullMQ Worker started — processing queues...', 'Worker');

  // Keep process alive for queue processing
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received — closing worker...', 'Worker');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received — closing worker...', 'Worker');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
