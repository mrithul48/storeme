-- 002_create_users_and_auth.sql

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "avatar" TEXT,
  "googleId" TEXT UNIQUE,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "password" TEXT,
  "passwordResetToken" TEXT UNIQUE,
  "passwordResetExpires" TIMESTAMP(3),
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "DeviceSession" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "deviceId" TEXT NOT NULL,
  "deviceName" TEXT,
  "platform" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "isRevoked" BOOLEAN NOT NULL DEFAULT FALSE,
  "revokedAt" TIMESTAMP(3),
  "revokedReason" TEXT,
  "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceSession_userId_deviceId_key" UNIQUE ("userId", "deviceId")
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "DeviceSession"("id") ON DELETE CASCADE,
  "tokenHash" TEXT UNIQUE NOT NULL,
  "familyId" TEXT NOT NULL,
  "generation" INTEGER NOT NULL DEFAULT 1,
  "isUsed" BOOLEAN NOT NULL DEFAULT FALSE,
  "usedAt" TIMESTAMP(3),
  "isRevoked" BOOLEAN NOT NULL DEFAULT FALSE,
  "revokedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "replacedByTokenHash" TEXT,
  "encryptedGracePayload" TEXT,
  "gracePayloadKeyVersion" TEXT,
  "gracePayloadExpiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

