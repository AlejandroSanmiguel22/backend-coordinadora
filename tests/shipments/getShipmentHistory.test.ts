import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('GET /api/shipments/:id/history', () => {
    let token: string;
    let shipmentId: number;

    beforeAll(async () => {
        const password = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.create({
            data: {
                email: 'historyadmin@test.com',
                password,
                userName: 'adminhistory',
                role: 'admin',
            }
        });

        token = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        const shipment = await prisma.shipment.create({
            data: {
                peso: 20,
                dimensiones: '10x10x10',
                tipoProducto: 'Libros',
                direccion: 'Calle 123',
                userId: admin.id
            }
        });

        shipmentId = shipment.id;

        await prisma.shipmentStatusHistory.createMany({
            data: [
                { shipmentId, estado: 'En espera' },
                { shipmentId, estado: 'En tránsito' },
            ]
        });
    });

    afterAll(async () => {
        await prisma.shipmentStatusHistory.deleteMany({
            where: { shipmentId: { not: undefined } },
        });
        await prisma.shipment.deleteMany({});

        await prisma.user.deleteMany({ where: { email: 'historyadmin@test.com' } });
        await prisma.$disconnect();
    });

    it('debería retornar el historial de estados del envío', async () => {
        const res = await request(app)
            .get(`/api/shipments/${shipmentId}/history`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('estado');
        expect(res.body[0]).toHaveProperty('timestamp');
    });
});
