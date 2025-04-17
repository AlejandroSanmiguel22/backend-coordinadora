import { z } from 'zod';

export const AssignShipmentSchema = z.object({
  routeId: z.number({
    required_error: 'El ID de la ruta es obligatorio',
    invalid_type_error: 'El ID de la ruta debe ser un número',
  }),
});

export type AssignShipmentDto = z.infer<typeof AssignShipmentSchema>;
