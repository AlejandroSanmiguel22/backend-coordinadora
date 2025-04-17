import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prismaClient';

export class ProfileController {
  static async handle(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener perfil de usuario', error });
    }
  }
}
