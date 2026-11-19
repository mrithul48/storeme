// apps/api/src/modules/auth/services/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../../database/database.service';
import { RedisService } from '../../../database/redis.service';
import { TokenRotationService } from './token-rotation.service';
import { AuthRepository } from '../repositories/auth.repository';
import {
  verifyPassword,
  hashToken,
  generateSecureToken,
  generateUuid,
} from '../utils/password.util';
import { LoginInput, RefreshTokenInput } from '@launchcommerce/validation';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessTokenTtlSeconds = 15 * 60; // 15 minutes
  private readonly refreshTokenTtlMs = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly tokenRotation: TokenRotationService,
    private readonly config: ConfigService,
  ) {}

  /**
   * User login with email & password.
   * Compatible with existing scrypt password hashes.
   * Generic error message to prevent account enumeration.
   */
  async login(input: LoginInput, clientIp?: string, userAgent?: string) {
    const email = input.email.trim().toLowerCase();

    const user = await this.authRepo.findUserWithStore(email);

    // Constant-time password verification (runs dummy verification if user is not found or has null password)
    const isPasswordValid = await verifyPassword(
      input.password,
      user?.password,
    );

    if (!user || !user.password || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEVICE SESSION MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    const deviceId = input.deviceId || generateUuid();
    const deviceName = input.deviceName || 'Unknown Device';
    const platform = input.platform || 'web';
    const now = new Date();

    // Upsert device session
    const session = await this.authRepo.upsertDeviceSession({
      userId: user.id,
      deviceId,
      deviceName,
      platform,
      ipAddress: clientIp,
      userAgent,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // INITIAL REFRESH TOKEN GENERATION (TOKEN FAMILY ROOT)
    // ─────────────────────────────────────────────────────────────────────────
    const familyId = generateUuid();
    const rawRefreshToken = generateSecureToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(now.getTime() + this.refreshTokenTtlMs);

    // Store only SHA-256 token hash in database (never plaintext)
    await this.authRepo.createRefreshToken({
      sessionId: session.id,
      tokenHash,
      familyId,
      generation: 1,
      expiresAt,
      isUsed: false,
      isRevoked: false,
    });

    // Sign Access Token JWT
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
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

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      store: user.store,
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
        expiresIn: this.accessTokenTtlSeconds,
      },
      session: {
        id: session.id,
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        platform: session.platform,
      },
    };
  }

  /**
   * Rotate refresh token using single-flight, atomic token consumption and grace recovery.
   */
  async refresh(input: RefreshTokenInput, clientIp?: string) {
    return this.tokenRotation.rotate(
      input.refreshToken,
      input.deviceId,
      clientIp,
    );
  }

  /**
   * Logout and revoke session and token family.
   */
  async logout(
    userId: string,
    rawRefreshToken?: string,
    deviceId?: string,
  ): Promise<{ success: boolean }> {
    const now = new Date();

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const token = await this.authRepo.findRefreshTokenByHash(tokenHash);

      if (token) {
        await this.tokenRotation.revokeFamilyAndSession(
          token.familyId,
          token.sessionId,
          'USER_LOGOUT',
        );
        // Clean up Redis grace cache
        this.redis.del(`auth:grace:${tokenHash}`).catch(() => {});
        return { success: true };
      }
    }

    if (deviceId) {
      const session = await this.authRepo.findDeviceSession(userId, deviceId);

      if (session) {
        await this.authRepo.revokeSession(session.id, 'USER_LOGOUT');
      }
    }

    return { success: true };
  }

  /**
   * Retrieve current authenticated user profile and tenant store.
   */
  async getMe(userId: string) {
    const user = await this.authRepo.findUserWithStore(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * List all device sessions for the authenticated user.
   */
  async getSessions(userId: string) {
    return this.authRepo.findDeviceSessionsByUserId(userId);
  }

  /**
   * Remote revocation of a specific device session.
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.authRepo.findDeviceSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Device session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Cannot revoke sessions belonging to another account');
    }

    await this.authRepo.revokeSession(sessionId, 'REMOTE_REVOKE');

    return { success: true };
  }
}

