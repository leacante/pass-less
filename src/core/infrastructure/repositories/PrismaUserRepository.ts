import { IUserRepository } from '@/core/domain/repositories/UserRepository';
import { prisma } from '@/lib/db';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<any> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<any> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async updateMasterPassword(userId: string, hash: string, salt: string): Promise<any> {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        masterPasswordHash: hash,
        masterPasswordSalt: salt,
        masterPasswordSetupAt: new Date(),
      },
    });
  }

  async create(user: any): Promise<any> {
    return await prisma.user.create({
      data: user,
    });
  }

  async update(id: string, user: any): Promise<any> {
    return await prisma.user.update({
      where: { id },
      data: user,
    });
  }
}
