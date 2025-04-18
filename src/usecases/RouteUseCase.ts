import { ShipmentRepository } from "./ShipmentRepository";

export class RouteUseCase {
  constructor(private shipmentRepository: ShipmentRepository) {}

  async getAllRoutesWithCarrier() {
    return await this.shipmentRepository.getAllRoutesWithCarrier();
  }
}
