import { Tag } from '@/core/domain/models/password';
import { TagRepository } from '@/core/domain/repositories/TagRepository';
import { getRandomTagColor } from '@/lib/tagColors';

export interface CreateTagInput {
  userId: string;
  name: string;
  color?: string;
}

export class CreateTagUseCase {
  constructor(private readonly repository: TagRepository) {}

  execute(input: CreateTagInput): Promise<Tag> {
    if (!input.name.trim()) {
      throw new Error('Name is required');
    }

    return this.repository.create({
      userId: input.userId,
      name: input.name.trim(),
      color: input.color ?? getRandomTagColor(),
    });
  }
}
