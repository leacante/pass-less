import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { CreatePasswordUseCase } from '@/core/application/use-cases/passwords/CreatePasswordUseCase';
import { UpdatePasswordUseCase } from '@/core/application/use-cases/passwords/UpdatePasswordUseCase';
import { DecryptPasswordUseCase } from '@/core/application/use-cases/passwords/DecryptPasswordUseCase';
import { PasswordRepository, CreatePasswordDTO, UpdatePasswordDTO } from '@/core/domain/repositories/PasswordRepository';
import { Password, PasswordSecret } from '@/core/domain/models/password';
import { NodeCryptoService } from '@/core/infrastructure/crypto/NodeCryptoService';

class InMemoryPasswordRepository implements PasswordRepository {
  private store = new Map<string, Password & PasswordSecret>();

  async listByUser(userId: string): Promise<Password[]> {
    return [...this.store.values()].filter((p) => p.userId === userId);
  }

  async create(data: CreatePasswordDTO): Promise<Password> {
    const id = crypto.randomUUID();
    const record: Password & PasswordSecret = {
      id,
      userId: data.userId,
      username: data.username,
      description: data.description,
      observation: data.observation ?? null,
      tagId: data.tagId ?? null,
      workspaceId: data.workspaceId ?? null,
      tag: null,
      workspace: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data.secret,
    };
    this.store.set(id, record);
    return record;
  }

  async update(data: UpdatePasswordDTO): Promise<Password> {
    const existing = this.store.get(data.id);
    if (!existing || existing.userId !== data.userId) {
      throw new Error('Password not found');
    }
    const updated: Password & PasswordSecret = {
      ...existing,
      username: data.username ?? existing.username,
      description: data.description ?? existing.description,
      observation: data.observation ?? existing.observation,
      tagId: data.tagId ?? existing.tagId,
      workspaceId: data.workspaceId ?? existing.workspaceId,
      updatedAt: new Date(),
      encryptedPassword: data.secret?.encryptedPassword ?? existing.encryptedPassword,
      iv: data.secret?.iv ?? existing.iv,
      authTag: data.secret?.authTag ?? existing.authTag,
    };
    this.store.set(data.id, updated);
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = this.store.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error('Password not found');
    }
    this.store.delete(id);
  }

  async getSecret(id: string, userId: string): Promise<PasswordSecret | null> {
    const existing = this.store.get(id);
    if (!existing || existing.userId !== userId) return null;
    return {
      encryptedPassword: existing.encryptedPassword,
      iv: existing.iv,
      authTag: existing.authTag,
    };
  }
}

describe('Password use cases', () => {
  const userId = 'user-123';
  const encryption = new NodeCryptoService();
  let repository: InMemoryPasswordRepository;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
    repository = new InMemoryPasswordRepository();
  });

  it('creates and decrypts a password', async () => {
    const creator = new CreatePasswordUseCase(repository, encryption);
    const decryptor = new DecryptPasswordUseCase(repository, encryption);

    const created = await creator.execute({
      userId,
      username: 'john',
      password: 'S3cr3t!',
      description: 'Github',
    });

    const plain = await decryptor.execute(created.id, userId);
    expect(plain).toBe('S3cr3t!');
    expect(created.id).toBeTruthy();
  });

  it('updates password with re-encryption', async () => {
    const creator = new CreatePasswordUseCase(repository, encryption);
    const updater = new UpdatePasswordUseCase(repository, encryption);
    const decryptor = new DecryptPasswordUseCase(repository, encryption);

    const created = await creator.execute({
      userId,
      username: 'alice',
      password: 'old',
      description: 'Vault',
    });

    await updater.execute({
      id: created.id,
      userId,
      password: 'new-secret',
      description: 'Vault updated',
    });

    const plain = await decryptor.execute(created.id, userId);
    expect(plain).toBe('new-secret');
  });

  it('prevents deleting non-owned passwords', async () => {
    const creator = new CreatePasswordUseCase(repository, encryption);
    const toDelete = await creator.execute({
      userId,
      username: 'bob',
      password: 'pwd',
      description: 'Email',
    });

    await expect(repository.delete(toDelete.id, 'other-user')).rejects.toThrow();
  });
});
