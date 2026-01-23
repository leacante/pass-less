'use server';

import { auth } from '@/lib/auth';
import { CreatePasswordUseCase } from '@/core/application/use-cases/passwords/CreatePasswordUseCase';
import { UpdatePasswordUseCase } from '@/core/application/use-cases/passwords/UpdatePasswordUseCase';
import { DeletePasswordUseCase } from '@/core/application/use-cases/passwords/DeletePasswordUseCase';
import { ListPasswordsUseCase } from '@/core/application/use-cases/passwords/ListPasswordsUseCase';
import { DecryptPasswordUseCase } from '@/core/application/use-cases/passwords/DecryptPasswordUseCase';
import { ListTagsUseCase } from '@/core/application/use-cases/tags/ListTagsUseCase';
import { CreateTagUseCase } from '@/core/application/use-cases/tags/CreateTagUseCase';
import { ListWorkspacesUseCase } from '@/core/application/use-cases/workspaces/ListWorkspacesUseCase';
import { CreateWorkspaceUseCase } from '@/core/application/use-cases/workspaces/CreateWorkspaceUseCase';
import { DeleteWorkspaceUseCase } from '@/core/application/use-cases/workspaces/DeleteWorkspaceUseCase';
import { PrismaPasswordRepository } from '@/core/infrastructure/repositories/PrismaPasswordRepository';
import { PrismaTagRepository } from '@/core/infrastructure/repositories/PrismaTagRepository';
import { PrismaWorkspaceRepository } from '@/core/infrastructure/repositories/PrismaWorkspaceRepository';
import { NodeCryptoService } from '@/core/infrastructure/crypto/NodeCryptoService';
import { Password, Tag, Workspace } from '@/core/domain/models/password';

const passwordRepo = new PrismaPasswordRepository();
const tagRepo = new PrismaTagRepository();
const workspaceRepo = new PrismaWorkspaceRepository();
const crypto = new NodeCryptoService();

interface SerializablePassword extends Omit<Password, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

function ensureUser() {
  return auth().then((session) => {
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }
    return session.user.id;
  });
}

function serializePassword(password: Password): SerializablePassword {
  return {
    ...password,
    createdAt: password.createdAt.toISOString(),
    updatedAt: password.updatedAt.toISOString(),
  };
}

export async function loadDashboardData(): Promise<{
  passwords: SerializablePassword[];
  tags: Tag[];
  workspaces: Workspace[];
}> {
  const userId = await ensureUser();

  const [passwords, tags, workspaces] = await Promise.all([
    new ListPasswordsUseCase(passwordRepo).execute(userId),
    new ListTagsUseCase(tagRepo).execute(userId),
    new ListWorkspacesUseCase(workspaceRepo).execute(userId),
  ]);

  return {
    passwords: passwords.map(serializePassword),
    tags,
    workspaces,
  };
}

export async function createPasswordAction(input: {
  username: string;
  password: string;
  description: string;
  observation?: string | null;
  tagId?: string | null;
  workspaceId?: string | null;
}): Promise<SerializablePassword> {
  const userId = await ensureUser();

  const passwordEntity = await new CreatePasswordUseCase(passwordRepo, crypto).execute({
    ...input,
    userId,
  });

  return serializePassword(passwordEntity);
}

export async function updatePasswordAction(input: {
  id: string;
  username?: string;
  password?: string;
  description?: string;
  observation?: string | null;
  tagId?: string | null;
  workspaceId?: string | null;
}): Promise<SerializablePassword> {
  const userId = await ensureUser();

  const passwordEntity = await new UpdatePasswordUseCase(passwordRepo, crypto).execute({
    ...input,
    userId,
  });

  return serializePassword(passwordEntity);
}

export async function deletePasswordAction(id: string): Promise<void> {
  const userId = await ensureUser();
  await new DeletePasswordUseCase(passwordRepo).execute(id, userId);
}

export async function decryptPasswordAction(id: string): Promise<string> {
  const userId = await ensureUser();
  return new DecryptPasswordUseCase(passwordRepo, crypto).execute(id, userId);
}

export async function createTagAction(input: { name: string; color?: string | null }): Promise<Tag> {
  const userId = await ensureUser();
  return new CreateTagUseCase(tagRepo).execute({ 
    name: input.name, 
    userId,
    color: input.color ?? undefined 
  });
}

export async function createWorkspaceAction(input: { name: string }): Promise<Workspace> {
  const userId = await ensureUser();
  return new CreateWorkspaceUseCase(workspaceRepo).execute({ ...input, userId });
}

export async function deleteWorkspaceAction(id: string): Promise<void> {
  const userId = await ensureUser();
  await new DeleteWorkspaceUseCase(workspaceRepo).execute(id, userId);
}
