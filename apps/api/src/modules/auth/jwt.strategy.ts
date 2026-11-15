import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthRequestUser, JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'arcivo-dev-jwt-secret',
    });
  }

  validate(payload: JwtPayload): AuthRequestUser {
    if (!payload.sub || (payload.type !== 'access' && payload.type !== 'extension')) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    return {
      id: payload.sub,
      email: payload.email,
      tokenType: payload.type,
    };
  }
}
