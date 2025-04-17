import { Request, Response } from 'express';
import { AssignShipmentSchema } from '../dto/AssignShipmentDto';
import { ShipmentRepositoryPrisma } from '../../infrastructure/database/ShipmentRepositoryPrisma';
import { AssignShipmentUseCase } from '../../usecases/AssignShipmentUseCase';

export class AssignShipmentController {
  static async handle(req: Request, res: Response): Promise<void> {
    const shipmentId = Number(req.params.id);
    const validation = AssignShipmentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    const { routeId } = validation.data;

    try {
      const repository = new ShipmentRepositoryPrisma();
      const useCase = new AssignShipmentUseCase(repository);
      const shipment = await useCase.execute(shipmentId, routeId);

      res.status(200).json(shipment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Error al asignar la ruta' });
    }
  }
}
