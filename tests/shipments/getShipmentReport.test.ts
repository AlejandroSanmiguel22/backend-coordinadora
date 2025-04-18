// tests/shipments/getShipmentReport.test.ts
import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectRedis, redisClient } from '../../src/infrastructure/cache/redisClient'; // 👈 esta línea

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('GET /api/shipments/report', () => {
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        await connectRedis(); // 👈 conexión Redis

        // Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'reportadmin@test.com' },
            update: {},
            create: {
                email: 'reportadmin@test.com',
                password: adminPassword,
                userName: 'admin',
                role: 'admin',
            },
        });
        adminToken = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        // Usuario normal
        const userPassword = await bcrypt.hash('user123', 10);
        const user = await prisma.user.upsert({
            where: { email: 'reportuser@test.com' },
            update: {},
            create: {
                email: 'reportuser@test.com',
                password: userPassword,
                userName: 'user',
                role: 'user',
            },
        });
        userToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    });

    it('debería permitir a un admin obtener el reporte', async () => {
        const res = await request(app)
            .get('/api/shipments/report')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('shipments');
        expect(res.body).toHaveProperty('metrics');
        expect(Array.isArray(res.body.shipments)).toBe(true);
        expect(Array.isArray(res.body.metrics)).toBe(true);
    });

    it('debería denegar acceso a usuarios no admin', async () => {
        const res = await request(app)
            .get('/api/shipments/report')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    it('debería requerir un token', async () => {
        const res = await request(app).get('/api/shipments/report');
        expect(res.status).toBe(401);
    });

    afterAll(async () => {
        await redisClient.disconnect(); // 👈 limpieza correcta
    });
});
