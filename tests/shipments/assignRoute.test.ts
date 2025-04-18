import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('PUT /api/shipments/:id/assign', () => {
    let admin: any;
    let adminToken: string;

    beforeAll(async () => {
        // Limpiar datos previos
        await prisma.shipmentStatusHistory.deleteMany();
        await prisma.shipment.deleteMany();
        await prisma.route.deleteMany();
        await prisma.carrier.deleteMany();
        await prisma.user.deleteMany();

        // Crear admin
        const password = await bcrypt.hash('admin123', 10);
        admin = await prisma.user.create({
            data: {
                email: 'admin@test.com',
                password,
                userName: 'admin',
                role: 'admin',
            },
        });

        adminToken = jwt.sign(
            { userId: admin.id, role: admin.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
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
        const carrier = await prisma.carrier.create({
            data: { nombre: 'Transportador Prueba', disponible: true },
        });

        const route = await prisma.route.create({
            data: {
                origen: 'Bogotá',
                destino: 'Cali',
                capacidad: 100,
                carrierId: carrier.id,
            },
        });

        const shipment = await prisma.shipment.create({
            data: {
                peso: 20,
                dimensiones: '10x10x10',
                tipoProducto: 'Ropa',
                direccion: 'Carrera 1 #2-3',
                userId: admin.id,
            },
        });

        const res = await request(app)
            .put(`/api/shipments/${shipment.id}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ routeId: route.id });

        if (res.status !== 200) console.error(res.body);

        expect(res.status).toBe(200);
        expect(res.body.routeId).toBe(route.id);
        expect(res.body.estado).toBe('En tránsito');
    });

    it('debería fallar si el transportista no está disponible', async () => {
        const carrier = await prisma.carrier.create({
            data: { nombre: 'Transportista Ocupado', disponible: false },
        });

        const blockedRoute = await prisma.route.create({
            data: {
                origen: 'Medellín',
                destino: 'Barranquilla',
                capacidad: 100,
                carrierId: carrier.id,
            },
        });

        const shipment = await prisma.shipment.create({
            data: {
                peso: 10,
                dimensiones: '10x10x10',
                tipoProducto: 'Libros',
                direccion: 'Calle falsa 123',
                userId: admin.id,
            },
        });

        const res = await request(app)
            .put(`/api/shipments/${shipment.id}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ routeId: blockedRoute.id });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/no está disponible/i);
    });

    it('debería fallar si la capacidad de la ruta se excede', async () => {
        const carrier = await prisma.carrier.create({
            data: { nombre: 'Transportador Limitado', disponible: true },
        });

        const tightRoute = await prisma.route.create({
            data: {
                origen: 'Tunja',
                destino: 'Cúcuta',
                capacidad: 30,
                carrierId: carrier.id,
            },
        });

        // Envío ya asignado que consume casi toda la capacidad
        await prisma.shipment.create({
            data: {
                peso: 25,
                dimensiones: '10x10x10',
                tipoProducto: 'Electrónica',
                direccion: 'Zona industrial',
                userId: admin.id,
                routeId: tightRoute.id,
                estado: 'En tránsito',
            },
        });

        const shipment = await prisma.shipment.create({
            data: {
                peso: 10,
                dimensiones: '10x10x10',
                tipoProducto: 'Relojes',
                direccion: 'Av. Siempre Viva',
                userId: admin.id,
            },
        });

        const res = await request(app)
            .put(`/api/shipments/${shipment.id}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ routeId: tightRoute.id });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/capacidad.*excedida/i);
    });

    it('debería denegar acceso a usuarios no administradores', async () => {
        const password = await bcrypt.hash('user123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'nonadminuser@test.com',
                password,
                userName: 'usuario',
                role: 'user',
            },
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const carrier = await prisma.carrier.create({
            data: { nombre: 'Transportador Extra', disponible: true },
        });

        const route = await prisma.route.create({
            data: {
                origen: 'Cali',
                destino: 'Neiva',
                capacidad: 100,
                carrierId: carrier.id,
            },
        });

        const shipment = await prisma.shipment.create({
            data: {
                peso: 5,
                dimensiones: '10x10x10',
                tipoProducto: 'Accesorios',
                direccion: 'Calle Luna Calle Sol',
                userId: user.id,
            },
        });

        const res = await request(app)
            .put(`/api/shipments/${shipment.id}/assign`)
            .set('Authorization', `Bearer ${token}`)
            .send({ routeId: route.id });

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/no tienes permisos/i);
    });
});
