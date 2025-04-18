import { Request, Response } from 'express';
import { GetShipmentReportUseCase } from '../../usecases/GetShipmentReportUseCase';

export class GetShipmentReportController {
  constructor(private readonly getReportUseCase: GetShipmentReportUseCase) {}

  async handle(req: Request, res: Response) {
    try {
      const { fechaDesde, fechaHasta, estado, transportistaId, page = 1, pageSize = 10 } = req.query;

      const filters = {
        fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
        estado: estado as string,
        transportistaId: transportistaId ? Number(transportistaId) : undefined,
        page: Number(page),
        pageSize: Number(pageSize),
      };

      const result = await this.getReportUseCase.execute(filters);
      res.json(result);
    } catch (error) {
      console.error('[GetShipmentReportController]', error);
      res.status(500).json({ error: 'Error al generar el reporte' });
    }
  }
}
