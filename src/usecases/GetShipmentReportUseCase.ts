import prisma from '../infrastructure/database/prismaClient';
import redisClient from '../infrastructure/cache/redisClient';

interface ReportFilters {
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: string;
  transportistaId?: number;
  page: number;
  pageSize: number;
}

export class GetShipmentReportUseCase {
  private readonly cacheTTL = 60; // segundos

  async execute(filters: ReportFilters) {
    const cacheKey = `report:${JSON.stringify(filters)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const where: any = {
      createdAt: {},
    };

    if (filters.fechaDesde) where.createdAt.gte = filters.fechaDesde;
    if (filters.fechaHasta) where.createdAt.lte = filters.fechaHasta;
    if (filters.estado) where.estado = filters.estado;
    if (filters.transportistaId) {
      where.route = {
        is: { carrierId: filters.transportistaId }
      };
    }


    const skip = (filters.page - 1) * filters.pageSize;

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          route: { include: { carrier: true } },
          user: true,
        },
        skip,
        take: filters.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shipment.count({ where }),
    ]);

    const metrics = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        r.carrierId,
        c.nombre AS carrierNombre,
        COUNT(s.id) AS totalEnvios,
        AVG(TIMESTAMPDIFF(SECOND, s.createdAt, h.timestamp)) AS tiempoPromedioSegundos
      FROM Shipment s
      INNER JOIN Route r ON s.routeId = r.id
      INNER JOIN Carrier c ON r.carrierId = c.id
      INNER JOIN ShipmentStatusHistory h ON s.id = h.shipmentId AND h.estado = 'Entregado'
      WHERE s.estado = 'Entregado'
      ${filters.fechaDesde ? `AND s.createdAt >= '${filters.fechaDesde.toISOString().slice(0, 19).replace('T', ' ')}'` : ''}
      ${filters.fechaHasta ? `AND s.createdAt <= '${filters.fechaHasta.toISOString().slice(0, 19).replace('T', ' ')}'` : ''}
      ${filters.transportistaId ? `AND r.carrierId = ${filters.transportistaId}` : ''}
      GROUP BY r.carrierId
    `);

    const result = {
      total,
      currentPage: filters.page,
      pageSize: filters.pageSize,
      shipments,
      metrics: metrics.map((m) => {
        const totalSecs = Number(m.tiempoPromedioSegundos);
        const horas = Math.floor(totalSecs / 3600);
        const minutos = Math.floor((totalSecs % 3600) / 60);

        return {
          ...m,
          tiempoPromedioSegundos: totalSecs,
          tiempoPromedioFormato: `${horas}h ${minutos}min`
        };
      }),
    };


    const resultToCache = JSON.parse(JSON.stringify(result, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    await redisClient.set(cacheKey, JSON.stringify(resultToCache), {
      EX: this.cacheTTL
    } as const);



    return result;
  }
}
