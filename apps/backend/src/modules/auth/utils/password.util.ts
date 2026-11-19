// apps/api/src/modules/auth/utils/password.util.ts
import * as crypto from 'crypto';

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024; // 64 MB

// Dummy hash for constant-time comparison on user not found / null password
const DUMMY_SCRYPT_HASH =
  'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  opts: crypto.ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, opts, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

/**
 * Verify plaintext password against stored scrypt hash.
 * Exact match with existing Next.js / NextAuth verification logic in src/lib/password.ts.
 */
export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  const targetHash = stored || DUMMY_SCRYPT_HASH;
  const parts = targetHash.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, nStr, rStr, pStr, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(hashB64, 'base64');

  try {
    const key = await scryptAsync(password, salt, expected.length, {
      N: Number(nStr),
      r: Number(rStr),
      p: Number(pStr),
      maxmem: MAXMEM,
    });

    const isMatch =
      key.length === expected.length && crypto.timingSafeEqual(key, expected);

    // If original hash was null/undefined, always return false
    return stored ? isMatch : false;
  } catch {
    return false;
  }
}

/**
 * Hash plaintext password using scrypt matching current database format.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await scryptAsync(password, salt, KEYLEN, {
    N,
    r: R,
    p: P,
    maxmem: MAXMEM,
  });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

/**
 * Calculate SHA-256 hex digest of a token string.
 * ONLY SHA-256 hashes of refresh tokens are stored in the database.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically secure URL-safe random token string.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate UUID v4 identifier.
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

