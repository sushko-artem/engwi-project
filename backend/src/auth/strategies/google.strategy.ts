import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { IGoogleProfile } from '../interfaces';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, _: string, profile: IGoogleProfile, done: VerifyCallback) {
    try {
      if (!profile.emails[0].verified) {
        throw new UnauthorizedException('Email not verified');
      }
      const user = await this.authService.handleGoogleProfile(profile);
      done(null, user);
    } catch (err) {
      done(err instanceof Error ? err : new Error('Auth failed'));
    }
  }
}
