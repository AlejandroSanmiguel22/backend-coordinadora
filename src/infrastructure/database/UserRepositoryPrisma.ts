import { User } from '../../domain/models/User';
import { UserRepository } from '../../usecases/UserRepository';
import prisma from './prismaClient';

export class UserRepositoryPrisma implements UserRepository {
  async create(user: User): Promise<User> {
    return await prisma.user.create({ data: user });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }
}
