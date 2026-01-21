import { PasswordRepository } from '@/core/domain/repositories/PasswordRepository';
import { EncryptionService } from '@/core/domain/services/EncryptionService';

export class DecryptPasswordUseCase {
  constructor(
    private readonly repository: PasswordRepository,
    private readonly encryption: EncryptionService,
  ) {}

  async execute(id: string, userId: string): Promise<string> {
    const secret = await this.repository.getSecret(id, userId);
    if (!secret) {
      throw new Error('Password not found');
    }

    return this.encryption.decrypt(secret, userId);
  }
}
