import { ShipmentRepository } from './ShipmentRepository';

export class UpdateShipmentStatusUseCase {
  constructor(private repository: ShipmentRepository) {}

  async execute(shipmentId: number, estado: string) {
    const shipment = await this.repository.findById(shipmentId);
    if (!shipment) throw new Error('Envío no encontrado');

    const updated = await this.repository.updateStatus(shipmentId, estado);
    await this.repository.saveStatusHistory(shipmentId, estado);

    return updated;
  }
}
