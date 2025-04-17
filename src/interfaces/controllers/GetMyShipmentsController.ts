import { Request, Response } from 'express';
import { ShipmentRepositoryPrisma } from '../../infrastructure/database/ShipmentRepositoryPrisma';

export class GetMyShipmentsController {
  static async handle(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    try {
      const repository = new ShipmentRepositoryPrisma();
      const shipments = await repository.getShipmentsByUserId(userId);
      res.status(200).json(shipments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener envíos', error });
    }
  }
}
