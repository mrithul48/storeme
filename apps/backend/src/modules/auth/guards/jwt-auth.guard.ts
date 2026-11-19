// apps/api/src/modules/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

interface JwtAccessPayload {
  sub: string;
  email: string;
  role: string;
  sessionId?: string;
  deviceId?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing authorization bearer header');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization bearer scheme');
    }

    const secret =
      this.config.get<string>('security.jwtAccessSecret') ||
      'launchcommerce-dev-jwt-access-secret-32-chars-min!';

    let payload: JwtAccessPayload;
    try {
      payload = this.jwtService.verify<JwtAccessPayload>(token, { secret });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }
      throw new UnauthorizedException('Invalid access token');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Malformed token payload');
    }

    // Attach verified user to request
    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
    };

    return true;
  }
}

