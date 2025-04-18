import { z } from 'zod';

export const UpdateShipmentStatusSchema = z.object({
  estado: z.enum(['En espera', 'En tránsito', 'Entregado'], {
    required_error: 'El estado es obligatorio',
    invalid_type_error: 'Estado no válido',
  }),
});

export type UpdateShipmentStatusDto = z.infer<typeof UpdateShipmentStatusSchema>;
