import crypto from 'crypto';
import { EncryptionService } from '@/core/domain/services/EncryptionService';
import { PasswordSecret } from '@/core/domain/models/password';
import { deriveMasterPasswordKey } from '@/lib/masterPassword';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32;

function getMasterKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

function deriveUserKey(userId: string): Buffer {
  const masterKey = getMasterKey();
  return crypto.pbkdf2Sync(masterKey, userId, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

export class NodeCryptoService implements EncryptionService {
  /**
   * Obtiene la clave de encriptación para un usuario
   * Si el usuario tiene master password, usa ese; si no, usa la clave derivada del ID
   */
  private getEncryptionKey(userId: string, masterPassword?: string): Buffer {
    if (masterPassword) {
      // Si se proporciona master password, derivar clave a partir de él
      return deriveMasterPasswordKey(masterPassword, userId);
    } else {
      // Si no, usar la clave derivada del ID del usuario (comportamiento anterior)
      return deriveUserKey(userId);
    }
  }

  encrypt(plaintext: string, userId: string, masterPassword?: string): PasswordSecret {
    const key = this.getEncryptionKey(userId, masterPassword);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      encryptedPassword: encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }

  decrypt(secret: PasswordSecret, userId: string, masterPassword?: string): string {
    const key = this.getEncryptionKey(userId, masterPassword);
    const ivBuffer = Buffer.from(secret.iv, 'base64');
    const authTagBuffer = Buffer.from(secret.authTag, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(secret.encryptedPassword, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
