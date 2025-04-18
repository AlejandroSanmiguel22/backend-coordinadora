import { z } from 'zod';

export const UpdateStatusSchema = z.object({
  estado: z.enum(['En espera', 'En tránsito', 'Entregado']),
});
