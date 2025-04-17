import { Carrier } from  './Carrier';

export interface Route {
  id: number;
  origen: string;
  destino: string;
  capacidad: number;
  carrierId: number;
  carrier?: Carrier; // Relación opcional
}
