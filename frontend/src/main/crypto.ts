import crypto from 'crypto';
import os from 'os';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;

/**
 * Generate encryption key based on machine-specific identifier
 */
function getEncryptionKey(): Buffer {
  const hostname = os.hostname();
  const username = os.userInfo().username;
  const identifier = `${hostname}-${username}`;

  return crypto.createHash('sha256').update(identifier).digest();
}

/**
 * Encrypt API key for storage
 */
export function encryptApiKey(plainKey: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encrypted format
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt API key from storage
 */
export function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey) return '';

  try {
    const parts = encryptedKey.split(':');
    if (parts.length !== 3) return encryptedKey; // Not encrypted, return as-is

    const [ivHex, authTagHex, encrypted] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}
