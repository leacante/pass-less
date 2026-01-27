import { TagRepository } from '@/core/domain/repositories/TagRepository';

export interface DeleteTagInput {
  tagId: string;
  userId: string;
}

export class DeleteTagUseCase {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: DeleteTagInput): Promise<void> {
    if (!input.tagId.trim()) {
      throw new Error('Tag ID is required');
    }

    return this.repository.delete(input.tagId, input.userId);
  }
}
