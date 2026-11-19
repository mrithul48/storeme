// apps/api/src/modules/auth/services/grace-encryption.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface GracePayload {
  accessToken: string;
  refreshToken: string; // Replacement raw refresh token
  expiresAt: number; // Unix timestamp in ms
  sessionId: string;
}

@Injectable()
export class GraceEncryptionService {
  private readonly logger = new Logger(GraceEncryptionService.name);
  private readonly primaryKey: Buffer;
  private readonly keyVersion = 'v1';

  constructor(private readonly config: ConfigService) {
    const rawKey =
      this.config.get<string>('security.authEncryptionKey') ||
      process.env.AUTH_ENCRYPTION_KEY ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    this.primaryKey = Buffer.from(rawKey, 'hex');
    if (this.primaryKey.length !== 32) {
      throw new Error(
        'AUTH_ENCRYPTION_KEY must be a 64-character hex string representing exactly 32 bytes for AES-256-GCM',
      );
    }
  }

  /**
   * Encrypt replacement credentials for database-level grace recovery.
   * Format: v1:iv:authTag:ciphertext (base64url encoded segments)
   * Authenticated Additional Data (AAD): bound to sessionId:familyId
   */
  encryptGracePayload(
    payload: GracePayload,
    familyId: string,
  ): { encryptedData: string; keyVersion: string; expiresAt: Date } {
    const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', this.primaryKey, iv);

    // Bind AAD to prevent payload swapping attacks across sessions or families
    const aad = `${payload.sessionId}:${familyId}`;
    cipher.setAAD(Buffer.from(aad, 'utf8'));

    const plaintext = JSON.stringify(payload);
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64url');
    ciphertext += cipher.final('base64url');

    const authTag = cipher.getAuthTag().toString('base64url');
    const ivB64 = iv.toString('base64url');

    const encryptedData = `${this.keyVersion}:${ivB64}:${authTag}:${ciphertext}`;
    return {
      encryptedData,
      keyVersion: this.keyVersion,
      expiresAt: new Date(payload.expiresAt),
    };
  }

  /**
   * Decrypt and verify database grace payload.
   * Validates AAD, auth tag, and expiration timestamp.
   */
  decryptGracePayload(
    encryptedData: string,
    sessionId: string,
    familyId: string,
  ): GracePayload | null {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 4) {
        this.logger.warn('Malformed encrypted grace payload format');
        return null;
      }

      const [version, ivB64, authTagB64, ciphertextB64] = parts;
      if (version !== this.keyVersion) {
        this.logger.warn(`Unsupported grace payload key version: ${version}`);
        return null;
      }

      const iv = Buffer.from(ivB64, 'base64url');
      const authTag = Buffer.from(authTagB64, 'base64url');

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.primaryKey, iv);
      const aad = `${sessionId}:${familyId}`;
      decipher.setAAD(Buffer.from(aad, 'utf8'));
      decipher.setAuthTag(authTag);

      let plaintext = decipher.update(ciphertextB64, 'base64url', 'utf8');
      plaintext += decipher.final('utf8');

      const payload = JSON.parse(plaintext) as GracePayload;

      // Verify payload internal session binding
      if (payload.sessionId !== sessionId) {
        this.logger.warn('Decrypted grace payload sessionId mismatch');
        return null;
      }

      // Check expiration
      if (payload.expiresAt <= Date.now()) {
        this.logger.debug('Decrypted grace payload has expired');
        return null;
      }

      return payload;
    } catch (err: any) {
      this.logger.warn(`Failed to decrypt grace payload: ${err.message}`);
      return null;
    }
  }
}
