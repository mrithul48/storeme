// apps/backend/src/modules/auth/repositories/auth.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import {
  UserEntity,
  UserWithStoreEntity,
  DeviceSessionEntity,
  RefreshTokenEntity,
  RefreshTokenWithSessionAndUser,
  UpsertDeviceSessionInput,
  CreateRefreshTokenInput,
} from '../interfaces/auth-entities.interface';
import { generateUuid } from '../utils/password.util';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly db: DatabaseService) {}

  private getExecutor(client?: IDbExecutor): IDbExecutor {
    if (client) return client;
    return {
      query: (sql, values) => this.db.execute(sql, values),
      queryRows: (sql, values) => this.db.query(sql, values),
      queryOne: (sql, values) => this.db.queryOne(sql, values),
    };
  }

  async findUserById(id: string, client?: IDbExecutor): Promise<UserEntity | null> {
    const sql = `
      SELECT "id", "email", "name", "avatar", "googleId", "role", "password", 
             "passwordResetToken", "passwordResetExpires", "emailVerified", 
             "createdAt", "updatedAt"
      FROM "User"
      WHERE "id" = $1
      LIMIT 1
    `;
    return this.getExecutor(client).queryOne<UserEntity>(sql, [id]);
  }

  async findUserByEmail(email: string, client?: IDbExecutor): Promise<UserEntity | null> {
    const sql = `
      SELECT "id", "email", "name", "avatar", "googleId", "role", "password", 
             "passwordResetToken", "passwordResetExpires", "emailVerified", 
             "createdAt", "updatedAt"
      FROM "User"
      WHERE LOWER("email") = LOWER($1)
      LIMIT 1
    `;
    return this.getExecutor(client).queryOne<UserEntity>(sql, [email]);
  }

  async findUserByGoogleId(googleId: string, client?: IDbExecutor): Promise<UserEntity | null> {
    const sql = `
      SELECT "id", "email", "name", "avatar", "googleId", "role", "password", 
             "passwordResetToken", "passwordResetExpires", "emailVerified", 
             "createdAt", "updatedAt"
      FROM "User"
      WHERE "googleId" = $1
      LIMIT 1
    `;
    return this.getExecutor(client).queryOne<UserEntity>(sql, [googleId]);
  }

  async findUserWithStore(idOrEmail: string, client?: IDbExecutor): Promise<UserWithStoreEntity | null> {
    const sql = `
      SELECT u."id", u."email", u."name", u."avatar", u."googleId", u."role", u."password",
             u."passwordResetToken", u."passwordResetExpires", u."emailVerified",
             u."createdAt", u."updatedAt",
             s."id" as "store_id", s."name" as "store_name", s."slug" as "store_slug",
             s."status" as "store_status", s."customDomain" as "store_customDomain"
      FROM "User" u
      LEFT JOIN "Store" s ON s."ownerId" = u."id"
      WHERE u."id" = $1 OR LOWER(u."email") = LOWER($1)
      LIMIT 1
    `;

    interface UserJoinRow extends UserEntity {
      store_id: string | null;
      store_name: string | null;
      store_slug: string | null;
      store_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | null;
      store_customDomain: string | null;
    }

    const row = await this.getExecutor(client).queryOne<UserJoinRow>(sql, [idOrEmail]);
    if (!row) return null;

    const {
      store_id,
      store_name,
      store_slug,
      store_status,
      store_customDomain,
      ...userFields
    } = row;

    return {
      ...userFields,
      store: store_id
        ? {
            id: store_id,
            name: store_name!,
            slug: store_slug!,
            status: store_status!,
            customDomain: store_customDomain,
          }
        : null,
    };
  }

  async createUser(
    data: {
      email: string;
      name?: string | null;
      avatar?: string | null;
      password?: string | null;
      googleId?: string | null;
      role?: 'USER' | 'PLATFORM_ADMIN';
      emailVerified?: boolean;
    },
    client?: IDbExecutor,
  ): Promise<UserEntity> {
    const id = generateUuid();
    const sql = `
      INSERT INTO "User" ("id", "email", "name", "avatar", "password", "googleId", "role", "emailVerified", "createdAt", "updatedAt")
      VALUES ($1, LOWER($2), $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;
    const res = await this.getExecutor(client).queryOne<UserEntity>(sql, [
      id,
      data.email,
      data.name ?? null,
      data.avatar ?? null,
      data.password ?? null,
      data.googleId ?? null,
      data.role ?? 'USER',
      data.emailVerified ?? false,
    ]);
    return res!;
  }

  async updateUser(
    id: string,
    data: Partial<{
      name: string | null;
      avatar: string | null;
      password: string | null;
      googleId: string | null;
      role: 'USER' | 'PLATFORM_ADMIN';
      emailVerified: boolean;
      passwordResetToken: string | null;
      passwordResetExpires: Date | null;
    }>,
    client?: IDbExecutor,
  ): Promise<UserEntity> {
    const fields: string[] = [];
    const values: unknown[] = [id];
    let idx = 2;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(val);
      }
    }

    fields.push(`"updatedAt" = NOW()`);

    const sql = `
      UPDATE "User"
      SET ${fields.join(', ')}
      WHERE "id" = $1
      RETURNING *
    `;
    const res = await this.getExecutor(client).queryOne<UserEntity>(sql, values);
    return res!;
  }

  async upsertDeviceSession(
    input: UpsertDeviceSessionInput,
    client?: IDbExecutor,
  ): Promise<DeviceSessionEntity> {
    const id = generateUuid();
    const sql = `
      INSERT INTO "DeviceSession" (
        "id", "userId", "deviceId", "deviceName", "platform", "ipAddress", "userAgent", 
        "isRevoked", "lastActiveAt", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, NOW(), NOW(), NOW())
      ON CONFLICT ("userId", "deviceId") DO UPDATE
      SET "deviceName" = EXCLUDED."deviceName",
          "platform" = EXCLUDED."platform",
          "ipAddress" = EXCLUDED."ipAddress",
          "userAgent" = EXCLUDED."userAgent",
          "isRevoked" = FALSE,
          "revokedAt" = NULL,
          "revokedReason" = NULL,
          "lastActiveAt" = NOW(),
          "updatedAt" = NOW()
      RETURNING *
    `;
    const res = await this.getExecutor(client).queryOne<DeviceSessionEntity>(sql, [
      id,
      input.userId,
      input.deviceId,
      input.deviceName ?? 'Unknown Device',
      input.platform ?? 'web',
      input.ipAddress ?? null,
      input.userAgent ?? null,
    ]);
    return res!;
  }

  async findDeviceSession(userId: string, deviceId: string, client?: IDbExecutor): Promise<DeviceSessionEntity | null> {
    const sql = `
      SELECT * FROM "DeviceSession"
      WHERE "userId" = $1 AND "deviceId" = $2
      LIMIT 1
    `;
    return this.getExecutor(client).queryOne<DeviceSessionEntity>(sql, [userId, deviceId]);
  }

  async findDeviceSessionById(sessionId: string, client?: IDbExecutor): Promise<DeviceSessionEntity | null> {
    const sql = `
      SELECT * FROM "DeviceSession"
      WHERE "id" = $1
      LIMIT 1
    `;
    return this.getExecutor(client).queryOne<DeviceSessionEntity>(sql, [sessionId]);
  }

  async findDeviceSessionsByUserId(userId: string, client?: IDbExecutor): Promise<DeviceSessionEntity[]> {
    const sql = `
      SELECT * FROM "DeviceSession"
      WHERE "userId" = $1
      ORDER BY "lastActiveAt" DESC
    `;
    return this.getExecutor(client).queryRows<DeviceSessionEntity>(sql, [userId]);
  }

  async updateDeviceSession(
    sessionId: string,
    data: Partial<DeviceSessionEntity>,
    client?: IDbExecutor,
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [sessionId];
    let idx = 2;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && key !== 'id') {
        fields.push(`"${key}" = $${idx++}`);
        values.push(val);
      }
    }
    fields.push(`"updatedAt" = NOW()`);

    const sql = `
      UPDATE "DeviceSession"
      SET ${fields.join(', ')}
      WHERE "id" = $1
    `;
    await this.getExecutor(client).query(sql, values);
  }

  async createRefreshToken(input: CreateRefreshTokenInput, client?: IDbExecutor): Promise<RefreshTokenEntity> {
    const id = generateUuid();
    const sql = `
      INSERT INTO "RefreshToken" (
        "id", "sessionId", "tokenHash", "familyId", "generation", 
        "isUsed", "isRevoked", "expiresAt", "encryptedGracePayload", 
        "gracePayloadKeyVersion", "gracePayloadExpiresAt", "createdAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;
    const res = await this.getExecutor(client).queryOne<RefreshTokenEntity>(sql, [
      id,
      input.sessionId,
      input.tokenHash,
      input.familyId,
      input.generation ?? 1,
      input.isUsed ?? false,
      input.isRevoked ?? false,
      input.expiresAt,
      input.encryptedGracePayload ?? null,
      input.gracePayloadKeyVersion ?? null,
      input.gracePayloadExpiresAt ?? null,
    ]);
    return res!;
  }

  async findRefreshTokenByHash(tokenHash: string, client?: IDbExecutor): Promise<RefreshTokenWithSessionAndUser | null> {
    const sql = `
      SELECT rt.*,
             ds."id" as "s_id", ds."userId" as "s_userId", ds."deviceId" as "s_deviceId",
             ds."deviceName" as "s_deviceName", ds."platform" as "s_platform",
             ds."ipAddress" as "s_ipAddress", ds."userAgent" as "s_userAgent",
             ds."isRevoked" as "s_isRevoked", ds."revokedAt" as "s_revokedAt",
             ds."revokedReason" as "s_revokedReason", ds."lastActiveAt" as "s_lastActiveAt",
             ds."createdAt" as "s_createdAt", ds."updatedAt" as "s_updatedAt",
             u."id" as "u_id", u."email" as "u_email", u."role" as "u_role"
      FROM "RefreshToken" rt
      INNER JOIN "DeviceSession" ds ON ds."id" = rt."sessionId"
      INNER JOIN "User" u ON u."id" = ds."userId"
      WHERE rt."tokenHash" = $1
      LIMIT 1
    `;

    interface JoinedTokenRow extends RefreshTokenEntity {
      s_id: string;
      s_userId: string;
      s_deviceId: string;
      s_deviceName: string | null;
      s_platform: string | null;
      s_ipAddress: string | null;
      s_userAgent: string | null;
      s_isRevoked: boolean;
      s_revokedAt: Date | null;
      s_revokedReason: string | null;
      s_lastActiveAt: Date;
      s_createdAt: Date;
      s_updatedAt: Date;
      u_id: string;
      u_email: string;
      u_role: 'USER' | 'PLATFORM_ADMIN';
    }

    const row = await this.getExecutor(client).queryOne<JoinedTokenRow>(sql, [tokenHash]);
    if (!row) return null;

    const {
      s_id,
      s_userId,
      s_deviceId,
      s_deviceName,
      s_platform,
      s_ipAddress,
      s_userAgent,
      s_isRevoked,
      s_revokedAt,
      s_revokedReason,
      s_lastActiveAt,
      s_createdAt,
      s_updatedAt,
      u_id,
      u_email,
      u_role,
      ...tokenFields
    } = row;

    return {
      ...tokenFields,
      session: {
        id: s_id,
        userId: s_userId,
        deviceId: s_deviceId,
        deviceName: s_deviceName,
        platform: s_platform,
        ipAddress: s_ipAddress,
        userAgent: s_userAgent,
        isRevoked: s_isRevoked,
        revokedAt: s_revokedAt,
        revokedReason: s_revokedReason,
        lastActiveAt: s_lastActiveAt,
        createdAt: s_createdAt,
        updatedAt: s_updatedAt,
        user: {
          id: u_id,
          email: u_email,
          role: u_role,
        },
      },
    };
  }

  async updateRefreshToken(
    id: string,
    data: Partial<RefreshTokenEntity>,
    client?: IDbExecutor,
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [id];
    let idx = 2;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && key !== 'id') {
        fields.push(`"${key}" = $${idx++}`);
        values.push(val);
      }
    }

    const sql = `
      UPDATE "RefreshToken"
      SET ${fields.join(', ')}
      WHERE "id" = $1
    `;
    await this.getExecutor(client).query(sql, values);
  }

  async revokeFamilyAndSession(
    familyId: string,
    sessionId: string,
    reason: string,
    client?: IDbExecutor,
  ): Promise<void> {
    const now = new Date();
    await this.getExecutor(client).query(
      `UPDATE "DeviceSession" SET "isRevoked" = TRUE, "revokedAt" = $1, "revokedReason" = $2 WHERE "id" = $3`,
      [now, reason, sessionId],
    );
    await this.getExecutor(client).query(
      `UPDATE "RefreshToken" SET "isRevoked" = TRUE, "revokedAt" = $1 WHERE "familyId" = $2 OR "sessionId" = $3`,
      [now, familyId, sessionId],
    );
  }

  async revokeSession(sessionId: string, reason: string, client?: IDbExecutor): Promise<void> {
    const now = new Date();
    await this.getExecutor(client).query(
      `UPDATE "DeviceSession" SET "isRevoked" = TRUE, "revokedAt" = $1, "revokedReason" = $2 WHERE "id" = $3`,
      [now, reason, sessionId],
    );
    await this.getExecutor(client).query(
      `UPDATE "RefreshToken" SET "isRevoked" = TRUE, "revokedAt" = $1 WHERE "sessionId" = $2`,
      [now, sessionId],
    );
  }

  async findRefreshTokenById(id: string, client?: IDbExecutor): Promise<RefreshTokenEntity | null> {
    const sql = `
      SELECT * FROM "RefreshToken"
      WHERE "id" = $1
      LIMIT 1
    `;
    return this.getExecutor(client).queryOne<RefreshTokenEntity>(sql, [id]);
  }

  async consumeRefreshTokenAtomic(
    id: string,
    data: {
      usedAt: Date;
      replacedByTokenHash: string;
      encryptedGracePayload?: string | null;
      gracePayloadKeyVersion?: string | null;
      gracePayloadExpiresAt?: Date | null;
    },
    client?: IDbExecutor,
  ): Promise<boolean> {
    const sql = `
      UPDATE "RefreshToken"
      SET "isUsed" = TRUE,
          "usedAt" = $2,
          "replacedByTokenHash" = $3,
          "encryptedGracePayload" = $4,
          "gracePayloadKeyVersion" = $5,
          "gracePayloadExpiresAt" = $6
      WHERE "id" = $1 AND "isUsed" = FALSE AND "isRevoked" = FALSE
    `;
    const res = await this.getExecutor(client).query(sql, [
      id,
      data.usedAt,
      data.replacedByTokenHash,
      data.encryptedGracePayload ?? null,
      data.gracePayloadKeyVersion ?? null,
      data.gracePayloadExpiresAt ?? null,
    ]);
    return res.rowCount === 1;
  }

  async updateDeviceSessionActivity(
    sessionId: string,
    ipAddress?: string | null,
    client?: IDbExecutor,
  ): Promise<void> {
    const sql = `
      UPDATE "DeviceSession"
      SET "lastActiveAt" = NOW(),
          "ipAddress" = COALESCE($2, "ipAddress"),
          "updatedAt" = NOW()
      WHERE "id" = $1
    `;
    await this.getExecutor(client).query(sql, [sessionId, ipAddress ?? null]);
  }

  async findUserByPasswordResetToken(token: string, client?: IDbExecutor): Promise<UserEntity | null> {
    const sql = `
      SELECT * FROM "User"
      WHERE "passwordResetToken" = $1
        AND "passwordResetExpires" > NOW()
      LIMIT 1
    `;
    return this.getExecutor(client).queryOne<UserEntity>(sql, [token]);
  }
}
