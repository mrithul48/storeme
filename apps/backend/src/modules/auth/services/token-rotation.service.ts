// apps/api/src/modules/auth/services/token-rotation.service.ts
import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../../database/database.service';
import { RedisService } from '../../../database/redis.service';
import { GraceEncryptionService } from './grace-encryption.service';
import { AuthRepository } from '../repositories/auth.repository';
import {
  hashToken,
  generateSecureToken,
} from '../utils/password.util';

export interface RotationResult {
  accessToken: string;
  refreshToken: string; // New raw replacement token
}

interface GraceCachedData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  sessionId: string;
}

@Injectable()
export class TokenRotationService {
  private readonly logger = new Logger(TokenRotationService.name);
  private readonly graceWindowMs = 30 * 1000; // 30 seconds idempotency grace window
  private readonly refreshTokenTtlMs = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly accessTokenTtlSeconds = 15 * 60; // 15 minutes

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly graceEncryption: GraceEncryptionService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Rotate a refresh token with atomic database transactions, distributed Redis grace caching,
   * AES-256-GCM database grace recovery, and persistent replay attack revocation.
   */
  async rotate(
    rawRefreshToken: string,
    deviceId: string,
    clientIp?: string,
  ): Promise<RotationResult> {
    const presentedTokenHash = hashToken(rawRefreshToken);
    const redisGraceKey = `auth:grace:${presentedTokenHash}`;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: FAST-PATH REDIS GRACE CACHE CHECK
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const cached = await this.redis.get(redisGraceKey);
      if (cached) {
        const parsed = JSON.parse(cached) as GraceCachedData;

        // Verify database session status: A revoked session must NEVER receive replacement credentials!
        const session = await this.authRepo.findDeviceSessionById(parsed.sessionId);

        if (!session || session.isRevoked || session.deviceId !== deviceId) {
          this.logger.warn(`Rejected grace response for revoked or mismatched session ${parsed.sessionId}`);
          throw new UnauthorizedException('Session has been revoked');
        }

        this.logger.debug(`Grace window cache hit for token hash: ${presentedTokenHash.substring(0, 10)}...`);
        return {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        };
      }
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) throw err;
      // If Redis is unreachable, continue to database evaluation (grace recovery via DB payload)
      this.logger.debug(`Redis grace lookup bypassed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: LOOKUP TOKEN AND SESSION IN DATABASE
    // ─────────────────────────────────────────────────────────────────────────
    const token = await this.authRepo.findRefreshTokenByHash(presentedTokenHash);

    if (!token) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const session = token.session;

    // Check device identifier binding
    if (session.deviceId !== deviceId) {
      this.logger.warn(
        `Device ID mismatch for token rotation: session ${session.deviceId} vs request ${deviceId}`,
      );
      throw new UnauthorizedException('Device binding mismatch');
    }

    // Check session active status
    if (session.isRevoked) {
      throw new UnauthorizedException('Device session has been revoked');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: REPLAY ATTACK DETECTION (TOKEN ALREADY REVOKED)
    // ─────────────────────────────────────────────────────────────────────────
    if (token.isRevoked) {
      this.logger.error(
        `CRITICAL SECURITY ALERT: Refresh token reuse detected! Family: ${token.familyId}, Session: ${session.id}`,
      );
      // Permanent family and session revocation MUST be committed before returning
      await this.revokeFamilyAndSession(
        token.familyId,
        session.id,
        'REPLAY_DETECTED',
      );
      throw new UnauthorizedException(
        'Security violation: Refresh token reuse detected. All sessions in this family have been revoked.',
      );
    }

    // Check expiration
    if (token.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: TOKEN ALREADY USED — DATABASE-LEVEL GRACE RECOVERY
    // ─────────────────────────────────────────────────────────────────────────
    if (token.isUsed) {
      // If token is used, check if we are within the database grace recovery window
      if (
        token.encryptedGracePayload &&
        token.gracePayloadExpiresAt &&
        token.gracePayloadExpiresAt.getTime() > Date.now()
      ) {
        const recovered = this.graceEncryption.decryptGracePayload(
          token.encryptedGracePayload,
          session.id,
          token.familyId,
        );

        if (recovered && recovered.expiresAt > Date.now()) {
          this.logger.debug(
            `Database grace recovery successful for token: ${presentedTokenHash.substring(0, 10)}...`,
          );

          // Populate Redis cache asynchronously to accelerate subsequent duplicate requests
          this.redis
            .set(redisGraceKey, JSON.stringify(recovered), 'EX', 30)
            .catch(() => {});

          return {
            accessToken: recovered.accessToken,
            refreshToken: recovered.refreshToken,
          };
        }
      }

      // If token is used and grace window has expired -> REPLAY ATTACK!
      this.logger.error(
        `Expired grace window token reuse! Family: ${token.familyId}, Session: ${session.id}`,
      );
      await this.revokeFamilyAndSession(
        token.familyId,
        session.id,
        'REPLAY_DETECTED_EXPIRED_GRACE',
      );
      throw new UnauthorizedException(
        'Security violation: Refresh token reuse detected outside grace window',
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: ATOMIC CONDITIONAL TOKEN CONSUMPTION & SUCCESSOR CREATION
    // ─────────────────────────────────────────────────────────────────────────
    const newRawRefreshToken = generateSecureToken();
    const newSuccessorTokenHash = hashToken(newRawRefreshToken);
    const now = new Date();
    const graceExpiresAt = new Date(now.getTime() + this.graceWindowMs);
    const newExpiresAt = new Date(now.getTime() + this.refreshTokenTtlMs);

    // Sign new access token
    const newAccessToken = this.jwtService.sign(
      {
        sub: session.user.id,
        email: session.user.email,
        role: session.user.role,
        sessionId: session.id,
        deviceId: session.deviceId,
      },
      {
        secret:
          this.config.get<string>('security.jwtAccessSecret') ||
          'launchcommerce-dev-jwt-access-secret-32-chars-min!',
        expiresIn: this.accessTokenTtlSeconds,
      },
    );

    const replacementPayload: GraceCachedData = {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      expiresAt: graceExpiresAt.getTime(),
      sessionId: session.id,
    };

    // Encrypt replacement payload for database-level grace recovery
    const { encryptedData, keyVersion } =
      this.graceEncryption.encryptGracePayload(
        replacementPayload,
        token.familyId,
      );

    try {
      await this.db.withTransaction(async (client) => {
        // ATOMIC CONDITIONAL UPDATE: Exactly one request can transition isUsed from false to true
        const updated = await this.authRepo.consumeRefreshTokenAtomic(
          token.id,
          {
            usedAt: now,
            replacedByTokenHash: newSuccessorTokenHash,
            encryptedGracePayload: encryptedData,
            gracePayloadKeyVersion: keyVersion,
            gracePayloadExpiresAt: graceExpiresAt,
          },
          client,
        );

        if (!updated) {
          // Another concurrent request consumed the token first
          throw new Error('CONCURRENT_ROTATION_COLLISION');
        }

        // Create replacement token record
        await this.authRepo.createRefreshToken(
          {
            sessionId: session.id,
            tokenHash: newSuccessorTokenHash,
            familyId: token.familyId,
            generation: token.generation + 1,
            expiresAt: newExpiresAt,
            isUsed: false,
            isRevoked: false,
          },
          client,
        );

        // Update session last active time and IP
        await this.authRepo.updateDeviceSessionActivity(session.id, clientIp || session.ipAddress, client);
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg === 'CONCURRENT_ROTATION_COLLISION') {
        // Handle concurrent request: Check the grace window for the winner's result
        this.logger.debug(
          `Concurrent collision resolved. Checking grace response for ${presentedTokenHash.substring(0, 10)}...`,
        );
        const winnerToken = await this.authRepo.findRefreshTokenById(token.id);

        if (
          winnerToken &&
          winnerToken.encryptedGracePayload &&
          winnerToken.gracePayloadExpiresAt &&
          winnerToken.gracePayloadExpiresAt.getTime() > Date.now()
        ) {
          const recovered = this.graceEncryption.decryptGracePayload(
            winnerToken.encryptedGracePayload,
            session.id,
            token.familyId,
          );
          if (recovered) {
            return {
              accessToken: recovered.accessToken,
              refreshToken: recovered.refreshToken,
            };
          }
        }
      }

      this.logger.error(`Failed to rotate refresh token: ${err instanceof Error ? err.message : String(err)}`);
      throw new UnauthorizedException('Failed to rotate authentication token');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6: POST-COMMIT REDIS GRACE CACHE PUBLICATION
    // ─────────────────────────────────────────────────────────────────────────
    // Publish to Redis ONLY after successful database transaction commit
    try {
      await this.redis.set(
        redisGraceKey,
        JSON.stringify(replacementPayload),
        'EX',
        30,
      );
    } catch (redisErr: unknown) {
      // Non-fatal: DB already has the encrypted grace payload stored, so grace recovery remains intact!
      this.logger.warn(
        `Failed to publish grace response to Redis (DB recovery is active): ${redisErr instanceof Error ? redisErr.message : String(redisErr)}`,
      );
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Permanently revoke token family and session in an independent transaction.
   */
  async revokeFamilyAndSession(
    familyId: string,
    sessionId: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.db.withTransaction(async (client) => {
        await this.authRepo.revokeFamilyAndSession(familyId, sessionId, reason, client);
      });
      this.logger.log(
        `Committed persistent revocation for family ${familyId} and session ${sessionId} (Reason: ${reason})`,
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to commit family revocation: ${errMsg}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }
}

