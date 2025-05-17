import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@user/user.service';
import { LoginUserDto, RegisterUserDto } from './DTO';
import { TokensService } from 'src/tokens/tokens.service';
import { compareSync } from 'bcrypt';
import { IGoogleProfile } from './interfaces';
import { IjwtPayload } from 'src/shared/interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly tokensService: TokensService,
  ) {}

  async register(dto: RegisterUserDto) {
    const user = await this.userService.findOne(dto.email).catch((err) => {
      this.logger.error(err);
      throw new InternalServerErrorException('Нет связи с базой данных');
    });
    if (user) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }
    return await this.userService.save(dto).catch((err) => {
      this.logger.error(err);
      throw new InternalServerErrorException('Невозможно создать пользователя.');
    });
  }

  async login(dto: LoginUserDto, userAgent: string) {
    const user = await this.userService.findOne(dto.email, true).catch((err) => {
      this.logger.error(err);
      throw new InternalServerErrorException('Нет связи с базой данных');
    });
    if (!user || !user?.password || !compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Не верно указан email или пароль');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, password, createdAt, updatedAt, ...payload } = user;
    return await this.tokensService.generateTokens(payload, userAgent);
  }

  async handleGoogleProfile(profile: IGoogleProfile) {
    const user = await this.userService.findOne(profile.emails[0].value);
    if (user) {
      user.name = profile.name?.givenName || user.name;
      return user;
    }
    return await this.userService.save({ name: profile.name.givenName, email: profile.emails[0].value });
  }

  async refersh(refreshToken: string, userAgent: string) {
    const payload = await this.tokensService.verifyRefreshToken(refreshToken);
    await this.tokensService.validateRefreshToken(refreshToken, payload.id);
    return await this.tokensService.generateTokens(
      {
        id: payload.id,
        email: payload.email,
        roles: payload.roles,
      },
      userAgent,
    );
  }

  async googleAuthGenerateTokens(payload: IjwtPayload, userAgent: string) {
    return await this.tokensService.generateTokens(payload, userAgent);
  }

  async deleteRefreshToken(token: string) {
    await this.tokensService.deleteRefreshTokenFromDB(token);
  }
}
