import { Password } from '@/core/domain/models/password';
import { PasswordRepository } from '@/core/domain/repositories/PasswordRepository';
import { EncryptionService } from '@/core/domain/services/EncryptionService';

export interface CreatePasswordInput {
  userId: string;
  username: string;
  password: string;
  description: string;
  observation?: string | null;
  tagId?: string | null;
  workspaceId?: string | null;
  masterPassword?: string; // Opcional: si el usuario tiene master password configurado
}

export class CreatePasswordUseCase {
  constructor(
    private readonly repository: PasswordRepository,
    private readonly encryption: EncryptionService,
  ) {}

  execute(input: CreatePasswordInput): Promise<Password> {
    if (!input.username || !input.password || !input.description) {
      throw new Error('Username, password and description are required');
    }

    const secret = this.encryption.encrypt(input.password, input.userId, input.masterPassword);

    return this.repository.create({
      userId: input.userId,
      username: input.username,
      description: input.description,
      observation: input.observation ?? null,
      tagId: input.tagId ?? null,
      workspaceId: input.workspaceId ?? null,
      secret,
    });
  }
}
