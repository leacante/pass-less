import { Password } from '@/core/domain/models/password';
import { PasswordRepository } from '@/core/domain/repositories/PasswordRepository';
import { EncryptionService } from '@/core/domain/services/EncryptionService';

export interface UpdatePasswordInput {
  id: string;
  userId: string;
  username?: string;
  password?: string;
  description?: string;
  observation?: string | null;
  tagId?: string | null;
  workspaceId?: string | null;
  masterPassword?: string; // Opcional: si el usuario tiene master password configurado
}

export class UpdatePasswordUseCase {
  constructor(
    private readonly repository: PasswordRepository,
    private readonly encryption: EncryptionService,
  ) {}

  execute(input: UpdatePasswordInput): Promise<Password> {
    const secret = input.password ? this.encryption.encrypt(input.password, input.userId, input.masterPassword) : undefined;

    return this.repository.update({
      id: input.id,
      userId: input.userId,
      username: input.username,
      description: input.description,
      observation: input.observation,
      tagId: input.tagId ?? undefined,
      workspaceId: input.workspaceId ?? undefined,
      secret,
    });
  }
}
