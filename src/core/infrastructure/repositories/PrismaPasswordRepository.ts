import { prisma } from '@/core/infrastructure/db/prismaClient';
import { Password, PasswordSecret } from '@/core/domain/models/password';
import { CreatePasswordDTO, PasswordRepository, UpdatePasswordDTO } from '@/core/domain/repositories/PasswordRepository';

function toPassword(payload: any): Password {
  return {
    id: payload.id,
    userId: payload.userId,
    username: payload.username,
    description: payload.description,
    observation: payload.observation ?? null,
    tagId: payload.tagId ?? null,
    workspaceId: payload.workspaceId ?? null,
    tag: payload.tag ? { id: payload.tag.id, name: payload.tag.name, color: payload.tag.color ?? null } : null,
    workspace: payload.workspace ? { id: payload.workspace.id, name: payload.workspace.name } : null,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  };
}

export class PrismaPasswordRepository implements PasswordRepository {
  async listByUser(userId: string): Promise<Password[]> {
    const rows = await prisma.password.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        username: true,
        description: true,
        observation: true,
        tagId: true,
        workspaceId: true,
        tag: true,
        workspace: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return rows.map(toPassword);
  }

  async create(data: CreatePasswordDTO): Promise<Password> {
    const row = await prisma.password.create({
      data: {
        userId: data.userId,
        username: data.username,
        description: data.description,
        observation: data.observation,
        tagId: data.tagId ?? undefined,
        workspaceId: data.workspaceId ?? undefined,
        encryptedPassword: data.secret.encryptedPassword,
        iv: data.secret.iv,
        authTag: data.secret.authTag,
      },
      select: {
        id: true,
        userId: true,
        username: true,
        description: true,
        observation: true,
        tagId: true,
        workspaceId: true,
        tag: true,
        workspace: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return toPassword(row);
  }

  async update(data: UpdatePasswordDTO): Promise<Password> {
    const exists = await prisma.password.findFirst({ where: { id: data.id, userId: data.userId } });
    if (!exists) {
      throw new Error('Password not found');
    }

    const row = await prisma.password.update({
      where: { id: data.id },
      data: {
        username: data.username,
        description: data.description,
        observation: data.observation,
        tagId: data.tagId ?? undefined,
        workspaceId: data.workspaceId ?? undefined,
        encryptedPassword: data.secret?.encryptedPassword,
        iv: data.secret?.iv,
        authTag: data.secret?.authTag,
      },
      select: {
        id: true,
        userId: true,
        username: true,
        description: true,
        observation: true,
        tagId: true,
        workspaceId: true,
        tag: true,
        workspace: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return toPassword(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const deleted = await prisma.password.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      throw new Error('Password not found');
    }
  }

  async getSecret(id: string, userId: string): Promise<PasswordSecret | null> {
    const row = await prisma.password.findFirst({
      where: { id, userId },
      select: { encryptedPassword: true, iv: true, authTag: true },
    });

    if (!row) return null;

    return {
      encryptedPassword: row.encryptedPassword,
      iv: row.iv,
      authTag: row.authTag,
    };
  }
}
