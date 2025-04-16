import { Request, Response } from 'express';
import { RegisterUserSchema } from '../dto/RegisterUserDto';
import { UserRepositoryPrisma } from '../../infrastructure/database/UserRepositoryPrisma';
import bcrypt from 'bcrypt';


export class RegisterController {
  static async handle(req: Request, res: Response) {
    // Validación con Zod
    const result = RegisterUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    const { email, password } = result.data;

    try {
      const userRepository = new UserRepositoryPrisma();

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'El usuario ya existe' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await userRepository.create({ email, password: hashedPassword });

      return res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
      return res.status(500).json({ message: 'Error al registrar usuario', error });
    }
  }
}
