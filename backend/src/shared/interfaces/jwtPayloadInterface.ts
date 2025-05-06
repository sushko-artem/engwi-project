import { Role } from '@prisma/client';

export interface IjwtPayload {
  id: string;
  email: string;
  roles: Role[];
}
