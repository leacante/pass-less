import { PasswordRepository } from '@/core/domain/repositories/PasswordRepository';

export class DeletePasswordUseCase {
  constructor(private readonly repository: PasswordRepository) {}

  execute(id: string, userId: string): Promise<void> {
    return this.repository.delete(id, userId);
  }
}
