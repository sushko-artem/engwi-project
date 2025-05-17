import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './DTO';
import { Request, Response } from 'express';
import { Cookie, Public, UserAgent } from '@common/decorators';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Itokens } from './interfaces';
import { GoogleGuard } from './guards/google.guard';
import { User } from '@prisma/client';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterUserDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Res() response: Response, @UserAgent() userAgent: string) {
    const tokens = await this.authService.login(dto, userAgent);
    this.saveTokensToCookies(tokens, response);
    return { message: 'Login successful' };
  }

  @Get('logout')
  async logout(@Cookie('refreshToken') refreshToken: string, @Res({ passthrough: true }) response: Response) {
    await this.authService.deleteRefreshToken(refreshToken);
    this.deleteTokensFromCookies(response);
    return { message: 'Logged out successfully' };
  }

  @Get('refresh')
  async refresh(
    @Cookie('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
    @UserAgent() userAgent: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const tokens = await this.authService.refersh(refreshToken, userAgent);
    this.saveTokensToCookies(tokens, response);
    return { message: 'Token refreshed' };
  }

  @Get('success') //TEST PAGE
  success(@Query() user: User) {
    return { user };
  }

  @UseGuards(GoogleGuard)
  @Get('google')
  googleAuth() {}

  @UseGuards(GoogleGuard)
  @Get('google/callback')
  async googleAuthCallback(@Req() request: Request, @Res() response: Response, @UserAgent() userAgent: string) {
    const user = request.user as User;
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
    const tokens = await this.authService.googleAuthGenerateTokens(payload, userAgent);
    this.saveTokensToCookies(tokens, response);
    return response.redirect(`http://localhost:4200/api/auth/success?=${JSON.stringify(user)}`);
  }

  private saveTokensToCookies(tokens: Itokens, response: Response) {
    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      sameSite: 'lax',
      maxAge: ms(this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES')),
      path: '/',
    });
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      sameSite: 'lax',
      maxAge: ms(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES')),
      path: '/',
    });
  }

  private deleteTokensFromCookies(response: Response) {
    response.cookie('accessToken', '', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    response.cookie('refreshToken', '', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
  }
}
