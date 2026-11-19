// apps/api/src/common/guards/internal-service.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../database/redis.service';

interface InternalHeader {
  alg: string;
  typ: string;
  kid?: string;
}

interface InternalClaims {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  role: 'USER' | 'PLATFORM_ADMIN';
  storeId?: string;
  iat: number;
  exp: number;
  jti: string;
}

@Injectable()
export class InternalServiceGuard implements CanActivate {
  private readonly logger = new Logger(InternalServiceGuard.name);
  private readonly keys: Record<string, string> = {};
  private static readonly devReplayCache = new Map<string, number>();

  private checkInMemoryReplay(key: string, ttlSeconds: number): boolean {
    const now = Date.now();
    if (InternalServiceGuard.devReplayCache.size > 1000) {
      for (const [k, exp] of InternalServiceGuard.devReplayCache.entries()) {
        if (exp <= now) {
          InternalServiceGuard.devReplayCache.delete(k);
        }
      }
    }

    const existingExp = InternalServiceGuard.devReplayCache.get(key);
    if (existingExp && existingExp > now) {
      return true; // Replayed
    }

    InternalServiceGuard.devReplayCache.set(key, now + ttlSeconds * 1000);
    return false; // Valid
  }

  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {
    const currentKey = this.config.get<string>('security.internalSecretCurrent') || '';
    const currentKid = this.config.get<string>('security.internalKeyId') || 'k1';
    const previousKey = this.config.get<string>('security.internalSecretPrevious');

    if (currentKey && currentKey.length >= 32) {
      this.keys[currentKid] = currentKey;
    }
    if (previousKey && previousKey.length >= 32) {
      this.keys['k0'] = previousKey;
    }

    if (Object.keys(this.keys).length === 0) {
      this.logger.warn('No internal service signing secrets configured with >= 32 characters');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-internal-token'] as string | undefined;

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Missing internal service authorization token');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Malformed internal service token');
    }

    const [b64Header, b64Payload, signature] = parts;

    // 1. VALIDATE HEADER
    let header: InternalHeader;
    try {
      header = JSON.parse(Buffer.from(b64Header, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid token header encoding');
    }

    // Require HS256 explicitly
    if (header.alg !== 'HS256') {
      throw new UnauthorizedException(`Unsupported signing algorithm: ${header.alg}. HS256 required.`);
    }

    // Require strict internal token type
    if (header.typ !== 'LC-INTERNAL+JWT') {
      throw new UnauthorizedException(`Invalid token type: ${header.typ}. Expected LC-INTERNAL+JWT.`);
    }

    // Select Secret based on Key ID (kid) for zero-downtime rotation
    const kid = header.kid || 'k1';
    const secret = this.keys[kid];
    if (!secret) {
      throw new UnauthorizedException(`Unknown or expired key identifier (kid: ${kid})`);
    }

    // 2. CONSTANT-TIME SIGNATURE VALIDATION
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${b64Header}.${b64Payload}`)
      .digest('base64url');

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      throw new UnauthorizedException('Internal token signature verification failed');
    }

    // 3. VALIDATE CLAIMS
    let claims: InternalClaims;
    try {
      claims = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid token payload encoding');
    }

    const now = Math.floor(Date.now() / 1000);

    // Validate Issuer & Audience
    if (claims.iss !== 'launchcommerce-nextjs' || claims.aud !== 'launchcommerce-nestjs') {
      throw new UnauthorizedException('Invalid token issuer or audience');
    }

    // Validate Timestamps & Lifespan
    if (claims.exp <= now) {
      throw new UnauthorizedException('Internal token has expired');
    }
    if (claims.iat > now + 5) {
      throw new UnauthorizedException('Token issued in future (clock skew exceeds 5s)');
    }
    if (claims.exp - claims.iat > 65) {
      throw new UnauthorizedException('Token lifespan exceeds allowed 60-second limit');
    }

    // Validate Subject & Role Types
    if (!claims.sub || typeof claims.sub !== 'string') {
      throw new UnauthorizedException('Invalid or missing subject claim');
    }
    if (claims.role !== 'USER' && claims.role !== 'PLATFORM_ADMIN') {
      throw new UnauthorizedException('Invalid user role claim');
    }

    // Validate JTI Format (UUID v4)
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!claims.jti || !uuidV4Regex.test(claims.jti)) {
      throw new UnauthorizedException('Malformed or missing JTI nonce (UUID v4 required)');
    }

    // 4. ATOMIC DISTRIBUTED REPLAY PROTECTION (Redis SET NX)
    const ttlSeconds = Math.max(claims.exp - now + 5, 10);
    const jtiKey = `auth:jti:${claims.jti}`;

    try {
      const setResult = await this.redis.set(jtiKey, '1', 'EX', ttlSeconds, 'NX');
      if (!setResult) {
        this.logger.warn(`Distributed replay attack blocked! Nonce reused: ${claims.jti}`);
        throw new UnauthorizedException('Internal token replay detected: Nonce already consumed');
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;

      // In development / test environments, fallback to in-memory replay cache if Redis is offline
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        const replayed = this.checkInMemoryReplay(jtiKey, ttlSeconds);
        if (replayed) {
          this.logger.warn(`Distributed replay attack blocked (dev in-memory fallback)! Nonce reused: ${claims.jti}`);
          throw new UnauthorizedException('Internal token replay detected: Nonce already consumed');
        }
      } else {
        // FAIL-CLOSED SECURITY POLICY IN PRODUCTION:
        // If Redis is unreachable in production, deny internal requests to prevent unverified execution
        this.logger.error('Redis replay registry unreachable during internal JWT verification', err);
        throw new ServiceUnavailableException('Authentication service temporarily degraded. Replay protection unavailable.');
      }
    }

    // 5. INDEPENDENT DATABASE IDENTITY LOOKUP
    interface DbUserRow {
      id: string;
      email: string;
      role: string;
    }
    const dbUser = await this.db.queryOne<DbUserRow>(
      `SELECT id, email, role FROM "User" WHERE id = $1 OR LOWER(email) = LOWER($1) OR "googleId" = $1 LIMIT 1`,
      [claims.sub],
    );

    if (!dbUser) {
      throw new UnauthorizedException('User associated with internal token does not exist in database');
    }

    req.user = dbUser;

    // Populate req.store for CurrentStore decorator when storeId is available
    const storeId = claims.storeId || (req.headers['x-store-id'] as string);
    if (storeId) {
      interface DbStoreRow {
        id: string;
        name: string;
        slug: string;
        status: string;
        ownerId: string;
      }
      const store = await this.db.queryOne<DbStoreRow>(
        `SELECT id, name, slug, status, "ownerId" FROM "Store" WHERE id = $1`,
        [storeId],
      );
      if (store) {
        req.store = store;
      }
    }

    return true;
  }
}

/**
 * Utility to generate a valid internal service token for Next.js -> NestJS communication.
 */
export function createInternalServiceToken(params: {
  sub: string;
  email: string;
  role: 'USER' | 'PLATFORM_ADMIN';
  secret: string;
  kid?: string;
  lifespanSeconds?: number;
  jti?: string;
  storeId?: string;
  iat?: number;
  iss?: string;
  aud?: string;
}): string {
  const now = params.iat ?? Math.floor(Date.now() / 1000);
  const exp = now + (params.lifespanSeconds ?? 30);
  const jti = params.jti ?? crypto.randomUUID();

  const header: InternalHeader = {
    alg: 'HS256',
    typ: 'LC-INTERNAL+JWT',
    kid: params.kid ?? 'k1',
  };

  const claims: InternalClaims = {
    iss: params.iss ?? 'launchcommerce-nextjs',
    aud: params.aud ?? 'launchcommerce-nestjs',
    sub: params.sub,
    email: params.email,
    role: params.role,
    storeId: params.storeId,
    iat: now,
    exp,
    jti,
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(claims)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', params.secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  return `${b64Header}.${b64Payload}.${signature}`;
}


