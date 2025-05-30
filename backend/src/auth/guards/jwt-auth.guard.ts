import { isPublic } from '@common/decorators/public.decorator';
import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const _isPublic = isPublic(ctx, this.reflector);
    if (_isPublic) return true;
    return super.canActivate(ctx);
  }
}
