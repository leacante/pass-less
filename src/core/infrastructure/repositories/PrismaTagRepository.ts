import { prisma } from '@/core/infrastructure/db/prismaClient';
import { CreateTagDTO, TagRepository } from '@/core/domain/repositories/TagRepository';
import { Tag } from '@/core/domain/models/password';

export class PrismaTagRepository implements TagRepository {
  async listByUser(userId: string): Promise<Tag[]> {
    const rows = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({ id: row.id, name: row.name, color: row.color ?? null }));
  }

  async create(data: CreateTagDTO): Promise<Tag> {
    const row = await prisma.tag.create({
      data: {
        name: data.name,
        color: data.color || '#6366f1',
        userId: data.userId,
      },
    });

    return { id: row.id, name: row.name, color: row.color ?? null };
  }

  async delete(tagId: string, userId: string): Promise<void> {
    await prisma.tag.deleteMany({
      where: {
        id: tagId,
        userId: userId,
      },
    });
  }
}
