import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('GET /api/shipments (admin)', () => {
    let adminToken: string;
    let normalToken: string;
    let adminId: number;
    const adminEmail = 'admin@getall.com';
    const userEmail = 'user@getall.com';

    beforeAll(async () => {
        // Limpiar datos previos
        await prisma.shipment.deleteMany({ where: { user: { email: { in: [adminEmail, userEmail] } } } });
        await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });

        // Crear usuario admin
        const hashedPassword = await bcrypt.hash('clave123', 10);
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                userName: 'adminUser',
                role: 'admin',
            },
        });
        adminId = admin.id;
        adminToken = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        // Crear usuario normal
        const normalUser = await prisma.user.create({
            data: {
                email: userEmail,
                password: hashedPassword,
                userName: 'normalUser',
                role: 'user',
            },
        });
        normalToken = jwt.sign({ userId: normalUser.id, role: normalUser.role }, JWT_SECRET, { expiresIn: '1h' });

        // Crear envío para admin
        await prisma.shipment.create({
            data: {
                peso: 2.0,
                dimensiones: '20x20x20',
                tipoProducto: 'Libros',
                direccion: 'Carrera 123 #45-67',
                estado: 'En espera',
                userId: admin.id,
            },
        });
    });

    afterAll(async () => {
        await prisma.shipment.deleteMany({ where: { userId: adminId } });
        try {
            await prisma.user.delete({ where: { email: adminEmail } });
            await prisma.user.delete({ where: { email: userEmail } });
        } catch (err) {
            console.warn('Usuarios ya eliminados');
        } finally {
            await prisma.$disconnect();
        }
    });

    it('debería permitir a un admin obtener todos los envíos', async () => {
        const res = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('peso');
    });

    it('debería denegar el acceso a usuarios no admin', async () => {
        const res = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${normalToken}`);

        expect(res.statusCode).toBe(403);
    });

    it('debería requerir un token', async () => {
        const res = await request(app).get('/api/shipments');
        expect(res.statusCode).toBe(401);
    });
});
