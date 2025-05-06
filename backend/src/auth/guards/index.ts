import { GoogleGuard } from './google.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guards';

export const GUARDS = [JwtAuthGuard, RolesGuard, GoogleGuard];
