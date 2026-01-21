import { Tag, Workspace } from '@/core/domain/models/password';

export interface PasswordDTO {
  id: string;
  userId: string;
  username: string;
  description: string;
  observation?: string | null;
  tagId?: string | null;
  tag?: Tag | null;
  workspaceId?: string | null;
  workspace?: Workspace | null;
  createdAt: string;
  updatedAt: string;
}
