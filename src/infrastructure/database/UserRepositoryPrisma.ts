import { User } from '../../domain/models/User';
import { UserRepository } from '../../usecases/UserRepository';
import prisma from './prismaClient';

export class UserRepositoryPrisma implements UserRepository {
  async create(user: User): Promise<User> {
    const createdUser = await prisma.user.create({ data: user });
    return { ...createdUser, role: createdUser.role ?? undefined };
  }

  async findByEmail(email: string): Promise<User | null> {
    const foundUser = await prisma.user.findUnique({ where: { email } });
    return foundUser ? { ...foundUser, role: foundUser.role ?? undefined } : null;
  }
}
