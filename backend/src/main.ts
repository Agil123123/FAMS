// ==========================================================
// FAMS Backend Entry Point
// ==========================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggerService } from './common/logger/logger.service';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(
    new HttpExceptionFilter(logger),
    new PrismaExceptionFilter(logger),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(logger),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'FAMS API')
    .setDescription(
      process.env.SWAGGER_DESCRIPTION ||
        'Fiber Asset Management System API Documentation',
    )
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Roles', 'Role management endpoints')
    .addTag('Permissions', 'Permission endpoints')
    .addTag('System', 'System endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(
    process.env.SWAGGER_PATH || 'api/docs',
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
    },
  );

  // Start
  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 FAMS Backend running on port ${port}`, 'Bootstrap');
  logger.log(
    `📚 Swagger docs at http://localhost:${port}/${process.env.SWAGGER_PATH || 'api/docs'}`,
    'Bootstrap',
  );
}

bootstrap();
