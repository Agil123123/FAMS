// ==========================================================
// JWT Refresh Strategy
// ==========================================================

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: { sub: string }) {
    return { id: payload.sub };
  }
}
