import { Request, Response } from 'express';
import { CreateShipmentUseCase } from '../../usecases/CreateShipmentUseCase';
import { ShipmentRepositoryPrisma } from '../../infrastructure/database/ShipmentRepositoryPrisma';
import { CreateShipmentSchema } from '../dto/CreateShipmentDto';

export class CreateShipmentController {
  static async handle(req: Request, res: Response): Promise<void> {
    const validation = CreateShipmentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    const { peso, dimensiones, tipoProducto, direccion } = validation.data;

    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const repository = new ShipmentRepositoryPrisma();
      const useCase = new CreateShipmentUseCase(repository);

      const shipment = await useCase.execute({
        peso,
        dimensiones,
        tipoProducto,
        direccion,
        userId,
      });

      res.status(201).json(shipment);
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar el envío', error });
    }
  }
}
