import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IjwtPayload } from 'src/shared/interfaces';

export const GetCurrentUser = createParamDecorator((_: string, context: ExecutionContext): IjwtPayload => {
  const request: Request = context.switchToHttp().getRequest();
  return request.user as IjwtPayload;
});
