import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
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
import { Public, UserAgent } from '@common/decorators';
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
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(`Can not register user with credentials ${JSON.stringify(dto)}`);
    }
    return { message: 'Created successful' };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Res() response: Response, @UserAgent() userAgent: string) {
    const tokens = await this.authService.login(dto, userAgent);
    if (!tokens) {
      throw new BadRequestException(`Can not enter with credentials ${JSON.stringify(dto)}`);
    }
    this.saveTokensToCookies(tokens, response);
    return response.status(HttpStatus.OK).json({ message: 'Login successful' });
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
    const refreshToken = request.cookies['refreshToken'] as string;
    if (!refreshToken) {
      return { message: 'OK' };
    }
    await this.authService.deleteRefreshToken(refreshToken);
    this.deleteTokensFromCookies(response);
    return { message: 'Logged out successfully' };
  }

  @Get('refresh')
  async refresh(@Res() response: Response, @Req() request: Request, @UserAgent() userAgent: string) {
    const refreshToken = request.cookies['refreshToken'] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const tokens = await this.authService.refersh(refreshToken, userAgent);
    this.saveTokensToCookies(tokens, response);
    return response.status(HttpStatus.OK).json({ message: 'Token refreshed' });
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
