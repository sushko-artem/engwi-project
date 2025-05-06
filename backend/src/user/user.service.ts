import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { genSaltSync, hashSync } from 'bcrypt';
import { IjwtPayload } from 'src/shared/interfaces';
import ms from 'ms';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async save(user: Partial<User>) {
    const hashedPassword = user?.password ? this.hashePassword(user.password) : null;
    return this.prisma.user.create({
      data: {
        name: user.name as string,
        email: user.email as string,
        password: hashedPassword,
        roles: [Role.USER],
      },
    });
  }

  async findOne(idOrEmail: string, isReset = false) {
    if (isReset) {
      await this.cacheManager.del(idOrEmail);
    }
    const user = await this.cacheManager.get<User>(idOrEmail);
    if (!user) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: idOrEmail }, { email: idOrEmail }],
        },
      });
      if (!user) {
        return null;
      }
      await this.cacheManager.set(idOrEmail, user, ms(this.configService.getOrThrow('JWT_ACCESS_EXPIRES')));
      return user;
    }
    return user;
  }

  async delete(id: string, user: IjwtPayload) {
    if (id !== user.id && !user.roles.includes(Role.SUPERUSER)) {
      throw new ForbiddenException();
    }
    await Promise.all([this.cacheManager.del(id), this.cacheManager.del(user.email)]);
    return this.prisma.user.delete({ where: { id }, select: { id: true } });
  }

  private hashePassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
