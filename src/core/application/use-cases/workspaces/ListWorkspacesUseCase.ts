import { Workspace } from '@/core/domain/models/password';
import { WorkspaceRepository } from '@/core/domain/repositories/WorkspaceRepository';

export class ListWorkspacesUseCase {
  constructor(private readonly repository: WorkspaceRepository) {}

  execute(userId: string): Promise<Workspace[]> {
    return this.repository.listByUser(userId);
  }
}
