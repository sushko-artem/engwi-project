import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { IjwtPayload } from '../shared/interfaces/jwtPayloadInterface';
import ms from 'ms';

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

  async verifyRefreshToken(refreshToken: string): Promise<IjwtPayload | null> {
    return this.jwtService
      .verifyAsync<IjwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async validateRefreshToken(token: string, userId: string): Promise<boolean> {
    const dbToken = await this.prisma.token
      .findUnique({
        where: {
          token,
          userId,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
    return !!dbToken && dbToken.exp > new Date();
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
