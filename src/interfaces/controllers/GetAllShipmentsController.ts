import { Request, Response } from 'express';
import { ShipmentRepositoryPrisma } from '../../infrastructure/database/ShipmentRepositoryPrisma';

export class GetAllShipmentsController {
  static async handle(req: Request, res: Response) {
    try {
      const repo = new ShipmentRepositoryPrisma();
      const shipments = await repo.getAll();
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener envíos', error });
    }
  }
}
