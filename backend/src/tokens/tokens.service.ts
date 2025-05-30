import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { IjwtPayload } from '../shared/interfaces/jwtPayloadInterface';
import ms from 'ms';
import { Prisma } from '@prisma/client';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: IjwtPayload, userAgent: string) {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
    await this.saveRefreshTokenToDB(payload.id, refreshToken, userAgent);
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string): Promise<IjwtPayload> {
    try {
      return await this.jwtService.verifyAsync<IjwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`Refresh token verification failed: ${err.message}`);

        if (err.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Refresh token expired');
        }
        if (err.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid refresh token');
        }
      }
      throw new InternalServerErrorException('Failed to verify token');
    }
  }

  async validateRefreshToken(token: string, userId: string): Promise<void> {
    try {
      const dbToken = await this.prisma.token.findUnique({
        where: {
          token,
          userId,
        },
      });
      if (!dbToken) {
        throw new UnauthorizedException('Refresh token not found in database');
      }
      if (dbToken.exp <= new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`Token validation failed: ${err.message}`);
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Database error');
      }
      throw err;
    }
  }

  async saveRefreshTokenToDB(userId: string, refreshToken: string, userAgent: string) {
    const maxAge = ms(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'));
    if (maxAge === undefined) {
      throw new Error('Invalid JWT_REFRESH_EXPIRES value');
    }
    const exp = new Date(Date.now() + maxAge);
    await this.prisma.token.upsert({
      where: {
        user_device_unique: {
          userAgent,
          userId,
        },
      },
      update: {
        token: refreshToken,
        exp,
      },
      create: {
        token: refreshToken,
        userId,
        userAgent,
        exp,
      },
    });
  }

  async deleteRefreshTokenFromDB(token: string) {
    await this.prisma.token.delete({ where: { token } });
  }
}
