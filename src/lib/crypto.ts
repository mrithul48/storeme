// src/lib/crypto.ts
// AES-256-GCM authenticated encryption for merchant payment credentials
// SERVER-ONLY — never import this in client components
//
// Key rotation note: The `iv` and `authTag` are stored alongside the ciphertext
// as a single colon-delimited string: `iv:authTag:ciphertext` (all hex).
// To rotate keys: re-encrypt each encryptedSecret with the new key during a
// background migration — the stored format contains all the metadata needed
// to decrypt with the original key and re-encrypt with the new one.

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // 96-bit IV — standard for GCM

function getEncryptionKey(): Buffer {
  const hexKey = process.env.RAZORPAY_CREDENTIAL_ENCRYPTION_KEY;
  if (!hexKey) {
    throw new Error(
      "[crypto] RAZORPAY_CREDENTIAL_ENCRYPTION_KEY is not set. " +
        "Generate a 32-byte hex key: node -e \"require('crypto').randomBytes(32).toString('hex')\" "
    );
  }

  const key = Buffer.from(hexKey, "hex");
  if (key.length !== 32) {
    throw new Error(
      "[crypto] RAZORPAY_CREDENTIAL_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)."
    );
  }
  return key;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a string in the format: `iv:authTag:ciphertext` (all hex-encoded).
 *
 * @param plaintext - The secret value to encrypt (e.g. Razorpay key_secret)
 * @returns Opaque encrypted string safe for database storage
 */
export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

/**
 * Decrypts an AES-256-GCM encrypted string produced by `encryptSecret`.
 *
 * @param encryptedValue - The stored `iv:authTag:ciphertext` string
 * @returns The original plaintext secret
 * @throws If the value is tampered or the key is wrong (auth tag mismatch)
 */
export function decryptSecret(encryptedValue: string): string {
  const key = getEncryptionKey();
  const parts = encryptedValue.split(":");

  if (parts.length !== 3) {
    throw new Error("[crypto] Invalid encrypted value format. Expected iv:authTag:ciphertext.");
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
