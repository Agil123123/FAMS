// ==========================================================
// Auth Service
// JWT token generation, refresh token rotation, Redis storage
// ==========================================================

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import Redis from 'ioredis';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../common/logger/logger.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.get('REDIS_PORT', 6379),
      password: this.config.get('REDIS_PASSWORD'),
    });
  }

  /**
   * Authenticate user and return JWT + refresh token
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with roles and permissions
    const user = await this.db.user.findFirst({
      where: { email, deleted_at: null },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is inactive or suspended');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Extract permissions
    const permissions = this.extractPermissions(user.user_roles);
    const roles = user.user_roles.map((ur: any) => ur.role.name);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, roles, permissions);

    // Store refresh token in Redis
    await this.storeRefreshToken(user.id, tokens.refresh_token);

    // Update last login
    await this.db.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    this.logger.log(`User logged in: ${user.email}`, 'AuthService');

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar: user.avatar,
        roles,
        permissions,
      },
      ...tokens,
    };
  }

  /**
   * Logout and invalidate refresh token
   */
  async logout(userId: string) {
    await this.redis.del(`refresh_token:${userId}`);
    this.logger.log(`User logged out: ${userId}`, 'AuthService');
    return { message: 'Logout successful' };
  }

  /**
   * Refresh access token using refresh token rotation
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Verify token exists in Redis
      const storedToken = await this.redis.get(`refresh_token:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get fresh user data
      const user = await this.db.user.findFirst({
        where: { id: payload.sub, deleted_at: null },
        include: {
          user_roles: {
            include: {
              role: {
                include: {
                  role_permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      const permissions = this.extractPermissions(user.user_roles);
      const roles = user.user_roles.map((ur: any) => ur.role.name);

      // Generate new tokens (rotation)
      const tokens = await this.generateTokens(user.id, user.email, roles, permissions);

      // Store new refresh token
      await this.storeRefreshToken(user.id, tokens.refresh_token);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.db.user.findFirst({
      where: { id: userId, deleted_at: null },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status,
      roles: user.user_roles.map((ur: any) => ur.role.name),
      last_login: user.last_login,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.db.user.update({
      where: { id: userId },
      data: {
        full_name: dto.full_name,
        phone: dto.phone,
        avatar: dto.avatar,
        updated_by: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        full_name: true,
        phone: true,
        avatar: true,
      },
    });
  }

  /**
   * Change password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.db.user.findFirst({
      where: { id: userId, deleted_at: null },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await argon2.verify(
      user.password,
      dto.current_password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await argon2.hash(dto.new_password);

    await this.db.user.update({
      where: { id: userId },
      data: { password: hashedPassword, updated_by: userId },
    });

    // Invalidate refresh token to force re-login
    await this.redis.del(`refresh_token:${userId}`);

    this.logger.log(`Password changed for user: ${userId}`, 'AuthService');

    return { message: 'Password changed successfully' };
  }

  // ── Private helpers ─────────────────────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    roles: string[],
    permissions: string[],
  ) {
    const payload = { sub: userId, email, roles, permissions };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  private async storeRefreshToken(userId: string, token: string) {
    // Store with 7-day expiry
    await this.redis.set(`refresh_token:${userId}`, token, 'EX', 7 * 24 * 60 * 60);
  }

  private extractPermissions(userRoles: any[]): string[] {
    const permissions = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.role_permissions) {
        permissions.add(rp.permission.name);
      }
    }
    return Array.from(permissions);
  }
}
