import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('GET /api/shipments/routes', () => {
    let adminToken: string;
    let routeId: string;
    let unavailableRouteId: string;
    let fullCapacityRouteId: string;

    beforeAll(async () => {
        // Crear usuario admin
        const password = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'routesadmin@test.com' },
            update: {},
            create: {
                email: 'routesadmin@test.com',
                password,
                userName: 'routesadmin',
                role: 'admin'
            }
        });

        adminToken = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, {
            expiresIn: '1h'
        });

        // Crear transportistas
        const availableCarrier = await prisma.carrier.create({
            data: { nombre: 'Conductor Disponible', disponible: true }
        });

        const unavailableCarrier = await prisma.carrier.create({
            data: { nombre: 'Conductor No Disponible', disponible: false }
        });

        // Crear rutas (sin capacidadActual que no existe en el modelo)
        const route = await prisma.route.create({
            data: {
                origen: 'Bogotá',
                destino: 'Medellín',
                capacidad: 100,
                carrierId: availableCarrier.id
            }
        });

        const unavailableRoute = await prisma.route.create({
            data: {
                origen: 'Cali',
                destino: 'Barranquilla',
                capacidad: 100,
                carrierId: unavailableCarrier.id
            }
        });

        const fullCapacityRoute = await prisma.route.create({
            data: {
                origen: 'Pereira',
                destino: 'Manizales',
                capacidad: 100,
                carrierId: availableCarrier.id
            }
        });

        // Convertir IDs a string como espera el test
        routeId = route.id.toString();
        unavailableRouteId = unavailableRoute.id.toString();
        fullCapacityRouteId = fullCapacityRoute.id.toString();
    });

    afterAll(async () => {
        await prisma.route.deleteMany();
        await prisma.carrier.deleteMany();
        await prisma.user.deleteMany({ where: { email: 'routesadmin@test.com' } });
        await prisma.$disconnect();
    });

    it('debería retornar todas las rutas con su transportista', async () => {
        const response = await request(app)
            .get('/api/shipments/routes')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('origen');
        expect(response.body[0]).toHaveProperty('destino');
        expect(response.body[0]).toHaveProperty('carrier');
        expect(response.body[0].carrier).toHaveProperty('nombre');
    });

    it('debería fallar si no hay token', async () => {
        const response = await request(app).get('/api/shipments/routes');
        expect(response.statusCode).toBe(401);
    });

    it('debería fallar si el usuario no es admin', async () => {
        const token = jwt.sign({ userId: 9999, role: 'user' }, JWT_SECRET, {
            expiresIn: '1h'
        });

        const response = await request(app)
            .get('/api/shipments/routes')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
    });
});