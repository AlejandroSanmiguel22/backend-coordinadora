import { Request, Response } from 'express';
import { ShipmentRepositoryPrisma } from '../../infrastructure/database/ShipmentRepositoryPrisma';
import redisClient from '../../infrastructure/cache/redisClient';
import { UpdateShipmentStatusUseCase } from '../../usecases/UpdateShipmentStatusUseCase';
import { UpdateShipmentStatusSchema } from '../../infrastructure/database/UpdateShipmentStatusDto';


export class UpdateShipmentStatusController {
  static async handle(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const validation = UpdateShipmentStatusSchema.safeParse(req.body);

    if (!id || isNaN(+id)) {
      res.status(400).json({ message: 'ID de envío inválido' });
      return;
    }

    if (!validation.success) {
      res.status(400).json({ errors: validation.error.flatten().fieldErrors });
      return;
    }

    try {
      const repository = new ShipmentRepositoryPrisma();
      const useCase = new UpdateShipmentStatusUseCase(repository);

      const updated = await useCase.execute(+id, validation.data.estado);

      const redisKey = `shipment:status:${updated.id}`;
      await redisClient.set(redisKey, updated.estado || '', { EX: 15 });

      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el estado del envío', error });
    }
  }
}
