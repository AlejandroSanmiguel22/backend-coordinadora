import { Request, Response } from 'express';
import { ShipmentRepositoryPrisma } from '../../infrastructure/database/ShipmentRepositoryPrisma';

export class GetShipmentHistoryController {
  static async handle(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(+id)) {
      res.status(400).json({ message: 'ID de envío inválido' });
      return;
    }

    const repo = new ShipmentRepositoryPrisma();

    try {
      const history = await repo.getStatusHistoryByShipmentId(+id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener historial del envío', error });
    }
  }
}
