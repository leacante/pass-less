import { PasswordSecret } from '@/core/domain/models/password';

export interface EncryptionService {
  encrypt(plaintext: string, userId: string, masterPassword?: string): PasswordSecret;
  decrypt(secret: PasswordSecret, userId: string, masterPassword?: string): string;
}
