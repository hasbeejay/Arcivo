import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthRequestUser } from './interfaces/jwt-payload.interface.js';

interface AuthenticatedRequest {
  user: AuthRequestUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthRequestUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
