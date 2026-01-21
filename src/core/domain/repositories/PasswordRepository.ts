import { Password, PasswordSecret } from '@/core/domain/models/password';

export interface CreatePasswordDTO {
  userId: string;
  username: string;
  description: string;
  observation?: string | null;
  tagId?: string | null;
  workspaceId?: string | null;
  secret: PasswordSecret;
}

export interface UpdatePasswordDTO {
  id: string;
  userId: string;
  username?: string;
  description?: string;
  observation?: string | null;
  tagId?: string | null;
  workspaceId?: string | null;
  secret?: PasswordSecret;
}

export interface PasswordRepository {
  listByUser(userId: string): Promise<Password[]>;
  create(data: CreatePasswordDTO): Promise<Password>;
  update(data: UpdatePasswordDTO): Promise<Password>;
  delete(id: string, userId: string): Promise<void>;
  getSecret(id: string, userId: string): Promise<PasswordSecret | null>;
}
