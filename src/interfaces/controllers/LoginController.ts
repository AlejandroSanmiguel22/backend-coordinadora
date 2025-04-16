import { Request, Response } from 'express';
import { LoginUserSchema } from '../dto/LoginUserDto';
import { UserRepositoryPrisma } from '../../infrastructure/database/UserRepositoryPrisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

export class LoginController {
    static async handle(req: Request, res: Response): Promise<void> {
        const result = LoginUserSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ errors: result.error.flatten().fieldErrors });
            return;
        }

        const { email, password } = result.data;

        try {
            const userRepository = new UserRepositoryPrisma();
            const user = await userRepository.findByEmail(email);

            if (!user) {
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                token,
                role: user.role
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al iniciar sesión', error });
        }
    }
}
