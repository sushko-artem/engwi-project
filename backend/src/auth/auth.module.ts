import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@user/user.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { PassportModule } from '@nestjs/passport';
import { STRATEGIES } from './strategies';
import { GUARDS } from './guards';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
  imports: [UserModule, TokensModule, PassportModule.register({ defaultStrategy: 'jwt' })],
})
export class AuthModule {}
