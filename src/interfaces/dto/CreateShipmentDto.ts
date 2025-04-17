import { z } from 'zod';

export const CreateShipmentSchema = z.object({
  peso: z.number().positive({ message: 'El peso debe ser mayor a 0' }),
  dimensiones: z.string().min(3, { message: 'Dimensiones requeridas' }),
  tipoProducto: z.string().min(3, { message: 'Tipo de producto requerido' }),
  direccion: z.string().min(10, { message: 'La dirección es obligatoria' }),
});

export type CreateShipmentDto = z.infer<typeof CreateShipmentSchema>;
