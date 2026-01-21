import { prisma } from '@/core/infrastructure/db/prismaClient';
import { CreateWorkspaceDTO, WorkspaceRepository } from '@/core/domain/repositories/WorkspaceRepository';
import { Workspace } from '@/core/domain/models/password';

export class PrismaWorkspaceRepository implements WorkspaceRepository {
  async listByUser(userId: string): Promise<Workspace[]> {
    const rows = await prisma.workspace.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({ id: row.id, name: row.name }));
  }

  async create(data: CreateWorkspaceDTO): Promise<Workspace> {
    const row = await prisma.workspace.create({
      data: { name: data.name, userId: data.userId },
    });

    return { id: row.id, name: row.name };
  }

  async delete(id: string, userId: string): Promise<void> {
    const deleted = await prisma.workspace.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      throw new Error('Workspace not found');
    }
  }
}
