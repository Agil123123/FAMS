// ==========================================================
// Config Validation Schema (Joi)
// ==========================================================

import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().default('http://localhost:3001'),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // MinIO
  MINIO_ENDPOINT: Joi.string().default('localhost'),
  MINIO_PORT: Joi.number().default(9000),
  MINIO_ACCESS_KEY: Joi.string().default('minio_access_key'),
  MINIO_SECRET_KEY: Joi.string().default('minio_secret_key_change_me'),
  MINIO_USE_SSL: Joi.boolean().default(false),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('debug'),
  LOG_DIR: Joi.string().default('logs'),

  // Swagger
  SWAGGER_TITLE: Joi.string().default('FAMS API'),
  SWAGGER_DESCRIPTION: Joi.string().default('Fiber Asset Management System API'),
  SWAGGER_VERSION: Joi.string().default('1.0'),
  SWAGGER_PATH: Joi.string().default('api/docs'),
});
