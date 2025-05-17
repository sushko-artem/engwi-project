import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './entities';
import { GetCurrentUser, Roles } from '@common/decorators';
import { IjwtPayload } from 'src/shared/interfaces';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':idOrEmail')
  async getOneUser(@Param('idOrEmail') idOrEmail: string) {
    const user = await this.userService.findOne(idOrEmail);
    if (!user) {
      throw new NotFoundException();
    }
    return new UserEntity(user);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string, @GetCurrentUser() user: IjwtPayload) {
    return await this.userService.delete(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPERUSER)
  @Get()
  get(@GetCurrentUser() user: IjwtPayload) {
    return this.userService.findOne(user.email);
  }
}
