import { ShipmentRepository } from './ShipmentRepository';

export class AssignShipmentUseCase {
  constructor(private shipmentRepository: ShipmentRepository) { }

  async execute(shipmentId: number, routeId: number) {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new Error('El envío no existe');
    }

    const route = await this.shipmentRepository.findRouteById(routeId);
    if (!route) {
      throw new Error('La ruta no existe');
    }

    const carrier = route.carrier;
    if (!carrier || !carrier.disponible) {
      throw new Error('El transportista asignado a esta ruta no está disponible');
    }

    const currentWeight = await this.shipmentRepository.getTotalWeightForRoute(routeId);

    if (currentWeight + shipment.peso > route.capacidad) {
      throw new Error('Capacidad de la ruta excedida');
    }

    return await this.shipmentRepository.assignRouteToShipment(shipmentId, routeId);
  }
}
