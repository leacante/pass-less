import { WorkspaceRepository } from '@/core/domain/repositories/WorkspaceRepository';

export class DeleteWorkspaceUseCase {
  constructor(private readonly repository: WorkspaceRepository) {}

  execute(id: string, userId: string): Promise<void> {
    return this.repository.delete(id, userId);
  }
}
