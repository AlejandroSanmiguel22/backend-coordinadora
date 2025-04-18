import { Shipment } from '../domain/models/Shipment';
import { Route } from '../domain/models/Route';

export interface ShipmentRepository {


  create(shipment: Omit<Shipment, 'id' | 'estado' | 'createdAt'>): Promise<Shipment>;

  getShipmentsByUserId(userId: number): Promise<Shipment[]>;

  findById(id: number): Promise<Shipment | null>;

  findRouteById(id: number): Promise<Route | null>;

  assignRouteToShipment(shipmentId: number, routeId: number): Promise<Shipment>;

  getTotalWeightForRoute(routeId: number): Promise<number>;

  getAll(): Promise<Shipment[]>;

  getAllRoutesWithCarrier(): Promise<Route[]>;

  saveStatusHistory(shipmentId: number, estado: string): Promise<void>;

  updateStatus(shipmentId: number, estado: string): Promise<Shipment>;



}
