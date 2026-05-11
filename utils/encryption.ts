/**
 * Encryption Utility for M4D CAFE POS
 * Uses AES-256-GCM for secure encryption
 */

// For Electron/Node.js environment
const crypto = typeof window !== 'undefined' && (window as any).require 
  ? (window as any).require('crypto') 
  : null;

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16;

// Storage key for the encryption key
const ENCRYPTION_KEY_STORAGE = 'pos_encryption_key';

/**
 * Get or generate encryption key
 * In production, this should be stored more securely (e.g., keychain)
 */
function getOrCreateKey(): Buffer {
  if (!crypto) {
    console.warn('Crypto not available, using fallback');
    return Buffer.alloc(KEY_LENGTH, 'default-key-for-browser');
  }

  let keyHex = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
  
  if (!keyHex) {
    // Generate a new random key
    const key = crypto.randomBytes(KEY_LENGTH);
    keyHex = key.toString('hex');
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, keyHex);
  }
  
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a plain text string
 * @param plainText - The text to encrypt
 * @returns Encrypted string (base64 encoded: iv:authTag:ciphertext)
 */
export function encrypt(plainText: string): string {
  if (!crypto) {
    // Fallback for browser: simple base64 encoding (NOT SECURE - just for compatibility)
    return `b64:${btoa(unescape(encodeURIComponent(plainText)))}`;
  }

  try {
    const key = getOrCreateKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:ciphertext (all base64 encoded)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedText - The encrypted string (iv:authTag:ciphertext format)
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';

  // Handle browser fallback
  if (encryptedText.startsWith('b64:')) {
    return decodeURIComponent(escape(atob(encryptedText.substring(4))));
  }

  if (!crypto) {
    console.warn('Crypto not available for decryption');
    return encryptedText;
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivBase64, authTagBase64, ciphertext] = parts;
    
    const key = getOrCreateKey();
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a password using SHA-256
 * This is a one-way hash, cannot be reversed
 * @param password - Plain text password
 * @returns Hashed password (hex string)
 */
export function hashPassword(password: string): string {
  if (!crypto) {
    // Browser fallback using SubtleCrypto would be async
    // For simplicity, use base64 encoding (NOT SECURE for production)
    return `hash:${btoa(password)}`;
  }

  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param storedHash - The stored hash
 * @returns true if password matches
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  // Handle browser fallback
  if (storedHash.startsWith('hash:')) {
    return btoa(password) === storedHash.substring(5);
  }

  const inputHash = hashPassword(password);
  return inputHash === storedHash;
}

/**
 * Generate a secure random string (for IDs, tokens, etc.)
 * @param length - Length of the string
 * @returns Random hex string
 */
export function generateSecureId(length: number = 16): string {
  if (!crypto) {
    // Browser fallback
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  return crypto.randomBytes(length).toString('hex');
}

export default {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateSecureId
};
