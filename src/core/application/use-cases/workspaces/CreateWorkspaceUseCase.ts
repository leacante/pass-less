import { Workspace } from '@/core/domain/models/password';
import { WorkspaceRepository } from '@/core/domain/repositories/WorkspaceRepository';

export interface CreateWorkspaceInput {
  userId: string;
  name: string;
}

export class CreateWorkspaceUseCase {
  constructor(private readonly repository: WorkspaceRepository) {}

  execute(input: CreateWorkspaceInput): Promise<Workspace> {
    if (!input.name.trim()) {
      throw new Error('Name is required');
    }

    return this.repository.create({ userId: input.userId, name: input.name.trim() });
  }
}
