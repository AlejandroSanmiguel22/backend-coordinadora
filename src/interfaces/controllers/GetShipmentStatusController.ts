import { Request, Response } from 'express';
import redisClient from '../../infrastructure/cache/redisClient';
import { ShipmentRepositoryPrisma } from '../../infrastructure/database/ShipmentRepositoryPrisma';

export class GetShipmentStatusController {
  static async handle(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(+id)) {
      res.status(400).json({ message: 'ID de envío inválido' });
      return;
    }

    const redisKey = `shipment:status:${id}`;

    try {
      const cached = await redisClient.get(redisKey);
      if (cached) {
        res.json({ status: cached, source: 'cache' });
        return;
      }

      const repository = new ShipmentRepositoryPrisma();
      const shipment = await repository.findById(+id);

      if (!shipment) {
        res.status(404).json({ message: 'Envío no encontrado' });
        return;
      }

      await redisClient.set(redisKey, shipment.estado || '', { EX: 15 });
      res.json({ status: shipment.estado, source: 'db' });

    } catch (error: any) {
      console.error('Error al obtener estado del envío:', error);
      res.status(500).json({
        message: 'Error al obtener el estado del envío',
        error: error.message || 'Error desconocido'
      });
    }

  }
}
