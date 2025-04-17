import { Shipment } from  '../domain/models/Shipment';

export interface ShipmentRepository {
  create(shipment: Omit<Shipment, 'id' | 'estado' | 'createdAt'>): Promise<Shipment>;
}
