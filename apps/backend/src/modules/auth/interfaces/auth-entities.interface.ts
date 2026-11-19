// apps/backend/src/modules/auth/interfaces/auth-entities.interface.ts

export type UserRole = 'USER' | 'PLATFORM_ADMIN';
export type StoreStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserEntity {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  googleId: string | null;
  role: UserRole;
  password: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreSummaryEntity {
  id: string;
  slug: string;
  name: string;
  status: StoreStatus;
  customDomain?: string | null;
}

export interface UserWithStoreEntity extends UserEntity {
  store: StoreSummaryEntity | null;
}

export interface DeviceSessionEntity {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string | null;
  platform: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isRevoked: boolean;
  revokedAt: Date | null;
  revokedReason: string | null;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenEntity {
  id: string;
  sessionId: string;
  tokenHash: string;
  familyId: string;
  generation: number;
  isUsed: boolean;
  usedAt: Date | null;
  isRevoked: boolean;
  revokedAt: Date | null;
  expiresAt: Date;
  replacedByTokenHash: string | null;
  encryptedGracePayload: string | null;
  gracePayloadKeyVersion: string | null;
  gracePayloadExpiresAt: Date | null;
  createdAt: Date;
}

export interface RefreshTokenWithSessionAndUser extends RefreshTokenEntity {
  session: DeviceSessionEntity & {
    user: Pick<UserEntity, 'id' | 'email' | 'role'>;
  };
}

export interface UpsertDeviceSessionInput {
  userId: string;
  deviceId: string;
  deviceName?: string;
  platform?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateRefreshTokenInput {
  sessionId: string;
  tokenHash: string;
  familyId: string;
  generation?: number;
  expiresAt: Date;
  isUsed?: boolean;
  isRevoked?: boolean;
  encryptedGracePayload?: string | null;
  gracePayloadKeyVersion?: string | null;
  gracePayloadExpiresAt?: Date | null;
}

