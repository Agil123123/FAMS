import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../common/logger/logger.service';

// Mock dependencies
jest.mock('argon2');
jest.mock('ioredis', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    })),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let db: DatabaseService;
  let jwtService: JwtService;

  const mockDb = {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'secret';
      if (key === 'JWT_EXPIRATION') return '15m';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      return null;
    }),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockDb.user.findFirst.mockResolvedValue(null);
      await expect(service.login({ email: 'test@test.com', password: 'password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockDb.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed-password',
        status: 'ACTIVE',
        user_roles: [],
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user data and tokens on success', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        username: 'test',
        password: 'hashed-password',
        status: 'ACTIVE',
        user_roles: [{ role: { name: 'admin', role_permissions: [] } }],
      };

      mockDb.user.findFirst.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

      const result = (await service.login({ email: 'test@test.com', password: 'password' })) as any;

      expect(result).toHaveProperty('access_token', 'access-token');
      expect(result).toHaveProperty('refresh_token', 'refresh-token');
      expect(result.user).toHaveProperty('email', 'test@test.com');
      expect(result.user.roles).toContain('admin');
    });
  });
});
