export interface Password {
  id: string;
  userId: string;
  username: string;
  description: string;
  observation?: string | null;
  tagId?: string | null;
  tag?: Tag | null;
  workspaceId?: string | null;
  workspace?: Workspace | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface PasswordSecret {
  encryptedPassword: string;
  iv: string;
  authTag: string;
}
