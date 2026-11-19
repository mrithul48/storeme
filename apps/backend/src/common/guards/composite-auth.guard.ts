// apps/api/src/common/guards/composite-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { InternalServiceGuard } from './internal-service.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class CompositeAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly internalServiceGuard: InternalServiceGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const internalToken = request.headers['x-internal-token'];
    const authHeader = request.headers['authorization'];

    // If internal token is provided, validate internal service JWT
    if (internalToken) {
      return this.internalServiceGuard.canActivate(context) as Promise<boolean>;
    }

    // If Bearer token is provided, validate user access token
    if (authHeader) {
      return this.jwtAuthGuard.canActivate(context) as Promise<boolean>;
    }

    // If route is public and no auth credentials provided, allow through
    if (isPublic) {
      return true;
    }

    throw new UnauthorizedException(
      'Authentication required: Provide a valid Bearer token or internal service token',
    );
  }
}

