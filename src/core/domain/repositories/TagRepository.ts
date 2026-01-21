import { Tag } from '@/core/domain/models/password';

export interface CreateTagDTO {
  userId: string;
  name: string;
  color?: string | null;
}

export interface TagRepository {
  listByUser(userId: string): Promise<Tag[]>;
  create(data: CreateTagDTO): Promise<Tag>;
}
