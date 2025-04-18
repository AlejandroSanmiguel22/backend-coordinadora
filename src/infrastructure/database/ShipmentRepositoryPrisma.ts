import { ShipmentRepository } from '../../usecases/ShipmentRepository';
import { Shipment } from '../../domain/models/Shipment';
import { Route } from '../../domain/models/Route';
import prisma from './prismaClient';

export class ShipmentRepositoryPrisma implements ShipmentRepository {
  async create(data: Omit<Shipment, 'id' | 'estado' | 'createdAt'>): Promise<Shipment> {
    return await prisma.shipment.create({ data });
  }

  async getShipmentsByUserId(userId: number): Promise<Shipment[]> {
    return await prisma.shipment.findMany({ where: { userId } });
  }

  async findById(id: number): Promise<Shipment | null> {
    return await prisma.shipment.findUnique({ where: { id } });
  }

  async findRouteById(id: number): Promise<Route | null> {
    return await prisma.route.findUnique({
      where: { id },
      include: { carrier: true },
    });
  }

  async assignRouteToShipment(shipmentId: number, routeId: number): Promise<Shipment> {
    return await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        routeId,
        estado: 'En tránsito',
      },
    });
  }

  async getTotalWeightForRoute(routeId: number): Promise<number> {
    const result = await prisma.shipment.aggregate({
      where: { routeId },
      _sum: { peso: true }
    });

    return result._sum.peso || 0;
  }

  async getAll(): Promise<Shipment[]> {
    return await prisma.shipment.findMany();
  }
  

}
