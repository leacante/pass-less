import { Workspace } from '@/core/domain/models/password';

export interface CreateWorkspaceDTO {
  userId: string;
  name: string;
}

export interface WorkspaceRepository {
  listByUser(userId: string): Promise<Workspace[]>;
  create(data: CreateWorkspaceDTO): Promise<Workspace>;
  delete(id: string, userId: string): Promise<void>;
}
