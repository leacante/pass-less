import { Tag } from '@/core/domain/models/password';
import { TagRepository } from '@/core/domain/repositories/TagRepository';

export class ListTagsUseCase {
  constructor(private readonly repository: TagRepository) {}

  execute(userId: string): Promise<Tag[]> {
    return this.repository.listByUser(userId);
  }
}
