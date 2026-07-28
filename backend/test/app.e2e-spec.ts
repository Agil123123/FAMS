// ==========================================================
// E2E Tests - App Bootstrap & Auth Flow
// ==========================================================

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('FAMS App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    let accessToken: string;
    let refreshToken: string;

    it('POST /api/v1/auth/login - should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@fams.id',
          password: 'Admin@123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
      expect(response.body.data.user.email).toBe('admin@fams.id');

      accessToken = response.body.data.access_token;
      refreshToken = response.body.data.refresh_token;
    });

    it('POST /api/v1/auth/login - should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@fams.id',
          password: 'wrong_password',
        })
        .expect(401);
    });

    it('GET /api/v1/auth/profile - should return profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@fams.id');
    });

    it('GET /api/v1/auth/profile - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('POST /api/v1/auth/refresh - should refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.access_token).toBeDefined();
    });
  });
});
