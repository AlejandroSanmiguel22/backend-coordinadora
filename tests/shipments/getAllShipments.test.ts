import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('GET /api/shipments (admin)', () => {
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        // Crear usuario admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'adminlist@test.com' },
            update: {},
            create: {
                email: 'adminlist@test.com',
                password: adminPassword,
                userName: 'admin',
                role: 'admin',
            },
        });
        adminToken = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        // Crear usuario normal
        const userPassword = await bcrypt.hash('user123', 10);
        const user = await prisma.user.upsert({
            where: { email: 'userlist@test.com' },
            update: {},
            create: {
                email: 'userlist@test.com', // 🔧 corregido aquí
                password: userPassword,
                userName: 'usuario',
                role: 'user',
            },
        });
        userToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        // Insertar un envío
        await prisma.shipment.create({
            data: {
                peso: 10,
                dimensiones: '10x10x10',
                tipoProducto: 'Libros',
                direccion: 'Calle 1 #2-3',
                userId: user.id,
            },
        });
    });

    afterAll(async () => {
        await prisma.shipmentStatusHistory.deleteMany(); // por si se generan registros en cascada
        await prisma.shipment.deleteMany();
        await prisma.user.deleteMany({ where: { email: { in: ['adminlist@test.com', 'userlist@test.com'] } } });
        await prisma.$disconnect();
    });

    it('debería permitir a un admin obtener todos los envíos', async () => {
        const res = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('debería denegar el acceso a usuarios no admin', async () => {
        const res = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/no tienes permisos/i);
    });

    it('debería requerir un token', async () => {
        const res = await request(app).get('/api/shipments');
        expect(res.statusCode).toBe(401);
    });
});
