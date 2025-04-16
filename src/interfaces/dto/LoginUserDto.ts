import { z } from 'zod';

export const LoginUserSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});

export type LoginUserDto = z.infer<typeof LoginUserSchema>;
