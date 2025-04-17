export interface Shipment {
    id?: number;
    peso: number;
    dimensiones: string;
    tipoProducto: string;
    direccion: string;
    estado?: string;
    userId: number;
    createdAt?: Date;
  }
  