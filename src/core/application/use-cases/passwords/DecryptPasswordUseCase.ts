import { PasswordRepository } from '@/core/domain/repositories/PasswordRepository';
import { EncryptionService } from '@/core/domain/services/EncryptionService';

export class DecryptPasswordUseCase {
  constructor(
    private readonly repository: PasswordRepository,
    private readonly encryption: EncryptionService,
  ) {}

  async execute(id: string, userId: string, masterPassword?: string): Promise<string> {
    const secret = await this.repository.getSecret(id, userId);
    if (!secret) {
      throw new Error('Password not found');
    }

    // Si se proporciona master password, intentar desencriptar primero con él
    // Si falla, intentar con la clave antigua (para contraseñas no migradas)
    if (masterPassword) {
      try {
        return this.encryption.decrypt(secret, userId, masterPassword);
      } catch (error) {
        // Si falla la desencriptación con master pass, intentar sin él (contraseña antigua)
        try {
          return this.encryption.decrypt(secret, userId, undefined);
        } catch (fallbackError) {
          // Si ambos fallan, lanzar el error original
          throw error;
        }
      }
    }

    return this.encryption.decrypt(secret, userId, masterPassword);
  }
}
