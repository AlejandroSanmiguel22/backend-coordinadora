import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

let admin: any;
describe('PUT /api/shipments/:id/assign', () => {
    let adminToken: string;
    let shipmentId: number;
    let routeId: number;

    beforeAll(async () => {
        // Crear admin
        const password = await bcrypt.hash('admin123', 10);
        admin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: {
                email: 'admin@test.com',
                password,
                userName: 'admin',
                role: 'admin',
            }
        });

        adminToken = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        // Crear un carrier
        const carrier = await prisma.carrier.create({
            data: { nombre: 'Transportador Prueba', disponible: true }
        });

        // Crear una ruta con capacidad suficiente
        const route = await prisma.route.create({
            data: {
                origen: 'Bogotá',
                destino: 'Cali',
                capacidad: 100,
                carrierId: carrier.id
            }
        });
        routeId = route.id;

        // Crear un envío
        const shipment = await prisma.shipment.create({
            data: {
                peso: 20,
                dimensiones: '10x10x10',
                tipoProducto: 'Ropa',
                direccion: 'Carrera 1 #2-3',
                userId: admin.id
            }
        });
        shipmentId = shipment.id;
    });

    afterAll(async () => {
        await prisma.shipmentStatusHistory.deleteMany();
        await prisma.shipment.deleteMany();
        await prisma.route.deleteMany();
        await prisma.carrier.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    it('debería asignar una ruta correctamente a un envío', async () => {
        const res = await request(app)
            .put(`/api/shipments/${shipmentId}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ routeId });

        expect(res.statusCode).toBe(200);
        expect(res.body.routeId).toBe(routeId);
        expect(res.body.estado).toBe('En tránsito');
    });

    it('debería fallar si el transportista no está disponible', async () => {
        const carrier = await prisma.carrier.create({
            data: { nombre: 'Transportista Ocupado', disponible: false }
        });

        const blockedRoute = await prisma.route.create({
            data: {
                origen: 'Medellín',
                destino: 'Barranquilla',
                capacidad: 100,
                carrierId: carrier.id
            }
        });

        const shipment = await prisma.shipment.create({
            data: {
                peso: 10,
                dimensiones: '10x10x10',
                tipoProducto: 'Libros',
                direccion: 'Calle falsa 123',
                userId: admin.id

            }
        });

        const res = await request(app)
            .put(`/api/shipments/${shipment.id}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ routeId: blockedRoute.id });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/no está disponible/i);
    });
    it('debería fallar si la capacidad de la ruta se excede', async () => {
        const carrier = await prisma.carrier.create({
            data: { nombre: 'Transportador Limitado', disponible: true }
        });

        const tightRoute = await prisma.route.create({
            data: {
                origen: 'Tunja',
                destino: 'Cúcuta',
                capacidad: 30,
                carrierId: carrier.id
            }
        });

        // Cargar la ruta al límite
        await prisma.shipment.create({
            data: {
                peso: 25,
                dimensiones: '10x10x10',
                tipoProducto: 'Electrónica',
                direccion: 'Zona industrial',
                userId: admin.id,
                routeId: tightRoute.id,
                estado: 'En tránsito'
            }
        });

        // Nuevo envío que excedería capacidad
        const shipment = await prisma.shipment.create({
            data: {
                peso: 10,
                dimensiones: '10x10x10',
                tipoProducto: 'Relojes',
                direccion: 'Av. Siempre Viva',
                userId: admin.id

            }
        });

        const res = await request(app)
            .put(`/api/shipments/${shipment.id}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ routeId: tightRoute.id });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/capacidad.*excedida/i);
    });
    it('debería denegar acceso a usuarios no administradores', async () => {
        const password = await bcrypt.hash('user123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'nonadminuser@test.com',
                password,
                userName: 'usuario',
                role: 'user'
            }
        });

        const token = jwt.sign({ userId: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

        const shipment = await prisma.shipment.create({
            data: {
                peso: 5,
                dimensiones: '10x10x10',
                tipoProducto: 'Accesorios',
                direccion: 'Calle Luna Calle Sol',
                userId: user.id
            }
        });

        const res = await request(app)
            .put(`/api/shipments/${shipment.id}/assign`)
            .set('Authorization', `Bearer ${token}`)
            .send({ routeId });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/no tienes permisos/i);
    });

});
