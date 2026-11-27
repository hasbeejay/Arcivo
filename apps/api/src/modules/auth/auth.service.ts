import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { DEFAULT_FOLDERS } from '../../common/default-folders.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { GoogleLoginDto } from './dto/google-login.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

const BCRYPT_ROUNDS = 10;

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private googleClientInstance?: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
          fullName: dto.fullName.trim(),
          folders: { create: DEFAULT_FOLDERS.map((folder) => ({ ...folder })) },
        },
      });

      const tokens = await this.issueTokens(user);
      return { user: this.toPublicUser(user), ...tokens };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account with this email already exists.');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const tokens = await this.issueTokens(user);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async loginWithGoogle(dto: GoogleLoginDto): Promise<AuthResponse> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured on this server. Set GOOGLE_CLIENT_ID in apps/api/.env.',
      );
    }

    let ticket;
    try {
      ticket = await this.googleClient(clientId).verifyIdToken({
        idToken: dto.credential,
        audience: clientId,
      });
    } catch {
      throw new UnauthorizedException('Google sign-in failed. Please try again.');
    }

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Google sign-in did not return an email address.');
    }
    if (payload.email_verified === false) {
      throw new UnauthorizedException('Your Google email address is not verified.');
    }

    const email = payload.email.toLowerCase();
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email }] },
    });

    if (user) {
      if (user.googleId && user.googleId !== payload.sub) {
        throw new ConflictException('This email is already linked to a different Google account.');
      }
      if (!user.googleId) {
        // Link the Google identity to an existing email/password account.
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            emailVerified: true,
            avatarUrl: user.avatarUrl ?? payload.picture ?? null,
          },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          googleId: payload.sub,
          emailVerified: true,
          fullName: payload.name?.trim() || email.split('@')[0],
          avatarUrl: payload.picture ?? null,
          folders: { create: DEFAULT_FOLDERS.map((folder) => ({ ...folder })) },
        },
      });
    }

    const tokens = await this.issueTokens(user);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }

    if (payload.type !== 'refresh' || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('This account no longer exists.');
    }

    const tokens = await this.issueTokens(user);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('This account no longer exists.');
    }
    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new UnauthorizedException('This account no longer exists.');
    }

    const avatarUrl =
      dto.avatarUrl === undefined
        ? undefined
        : dto.avatarUrl === null || dto.avatarUrl.trim() === ''
          ? null
          : dto.avatarUrl.trim();

    if (avatarUrl && !/^(https?:\/\/|data:image\/)/i.test(avatarUrl)) {
      throw new BadRequestException('Avatar must be an image URL or an uploaded image.');
    }

    let user: User;
    try {
      user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.fullName !== undefined ? { fullName: dto.fullName.trim() } : {}),
          ...(dto.username !== undefined ? { username: dto.username.trim().toLowerCase() } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('That username is already in use.');
      }
      throw error;
    }

    return this.toPublicUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('This account no longer exists.');
    }

    if (user.passwordHash) {
      const matches = dto.currentPassword
        ? await bcrypt.compare(dto.currentPassword, user.passwordHash)
        : false;
      if (!matches) {
        throw new UnauthorizedException('Current password is incorrect.');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS) },
    });

    return { updated: true };
  }

  async createExtensionToken(userId: string): Promise<{ token: string; expiresIn: string; user: PublicUser }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('This account no longer exists.');
    }

    const expiresIn = this.config.get<string>('EXTENSION_TOKEN_EXPIRES_IN') ?? '90d';
    const token = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'extension' },
      { expiresIn: expiresIn as never },
    );

    return { token, expiresIn, user: this.toPublicUser(user) };
  }

  private async issueTokens(user: Pick<User, 'id' | 'email'>): Promise<TokenPair> {
    const basePayload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync({
      ...basePayload,
      type: 'access',
    });

    const refreshToken = await this.jwtService.signAsync(
      { ...basePayload, type: 'refresh' },
      {
        secret: this.refreshSecret(),
        expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d') as never,
      },
    );

    return { accessToken, refreshToken };
  }

  private refreshSecret(): string {
    return (
      this.config.get<string>('JWT_REFRESH_SECRET') ??
      this.config.get<string>('JWT_SECRET') ??
      'arcivo-dev-refresh-secret'
    );
  }

  private googleClient(clientId: string): OAuth2Client {
    if (!this.googleClientInstance) {
      this.googleClientInstance = new OAuth2Client(clientId);
    }
    return this.googleClientInstance;
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
