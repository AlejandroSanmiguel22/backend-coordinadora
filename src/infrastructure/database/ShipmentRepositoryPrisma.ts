import { ShipmentRepository } from '../../usecases/ShipmentRepository';
import { Shipment } from '../../domain/models/Shipment';
import prisma from './prismaClient';

export class ShipmentRepositoryPrisma implements ShipmentRepository {
  async create(shipment: Omit<Shipment, 'id' | 'estado' | 'createdAt'>): Promise<Shipment> {
    const result = await prisma.shipment.create({
      data: {
        ...shipment,
        estado: 'En espera', // aseguramos estado inicial
      },
    });

    return result;
  }

  async getShipmentsByUserId(userId: number): Promise<Shipment[]> {
    return await prisma.shipment.findMany({ where: { userId } });
  }
  
  
}
