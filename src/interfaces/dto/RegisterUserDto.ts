import { z } from 'zod';

export const RegisterUserSchema = z.object({
  userName: z.string().min(3, { message: 'El nombre de usuario es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
