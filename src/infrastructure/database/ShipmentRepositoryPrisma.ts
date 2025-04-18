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
    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        routeId,
        estado: 'En tránsito',
      },
    });
    await this.saveStatusHistory(shipmentId, 'En tránsito');

    return updatedShipment;
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

  async getAllRoutesWithCarrier(): Promise<Route[]> {
    return await prisma.route.findMany({
      include: {
        carrier: true,
      },
    });
  }

  async saveStatusHistory(shipmentId: number, estado: string): Promise<void> {
    await prisma.shipmentStatusHistory.create({
      data: {
        shipmentId,
        estado,
      },
    });
  }

  async getStatusHistoryByShipmentId(shipmentId: number) {
    return await prisma.shipmentStatusHistory.findMany({
      where: { shipmentId },
      orderBy: { timestamp: 'asc' }
    });
  }



}
