import { Request, Response } from 'express';
import { RouteUseCase } from  '../../usecases/RouteUseCase';
import { ShipmentRepositoryPrisma } from '../../infrastructure/database/ShipmentRepositoryPrisma';

const useCase = new RouteUseCase(new ShipmentRepositoryPrisma());

export class GetRoutesController {
    static async handle(req: Request, res: Response) {
        try {
            const result = await useCase.getAllRoutesWithCarrier();
            res.json(result);
        } catch (error) {
            console.error('Error en GetRoutesController:', error);
            res.status(500).json({ message: 'Error al obtener rutas' });
        }
    }
}

