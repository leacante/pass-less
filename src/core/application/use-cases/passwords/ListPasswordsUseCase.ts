import { Password } from '@/core/domain/models/password';
import { PasswordRepository } from '@/core/domain/repositories/PasswordRepository';

export class ListPasswordsUseCase {
  constructor(private readonly repository: PasswordRepository) {}

  execute(userId: string): Promise<Password[]> {
    return this.repository.listByUser(userId);
  }
}
