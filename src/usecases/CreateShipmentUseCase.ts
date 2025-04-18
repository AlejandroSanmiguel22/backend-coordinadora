import { ShipmentRepository } from './ShipmentRepository';
import { Shipment } from '../domain/models/Shipment';

interface CreateShipmentInput {
  peso: number;
  dimensiones: string;
  tipoProducto: string;
  direccion: string;
  userId: number;
}

export class CreateShipmentUseCase {
  constructor(private repository: ShipmentRepository) {}

  async execute(data: CreateShipmentInput): Promise<Shipment> {
    return await this.repository.create({
      ...data,
    });

    
  }
}
