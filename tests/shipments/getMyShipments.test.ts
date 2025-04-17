import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('GET /api/shipments/mine', () => {
  const email = 'mineuser@example.com';
  const password = 'clave123';
  const userName = 'mineuser';
  let userId: number;
  let token: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        userName,
        role: 'user',
      },
    });

    userId = user.id;
    token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Crear envío de prueba
    await prisma.shipment.create({
      data: {
        peso: 1.2,
        dimensiones: '15x15x15',
        tipoProducto: 'Zapatos',
        direccion: 'Calle 123 #45-67',
        userId,
        estado: 'En espera',
      },
    });
  });

  afterAll(async () => {
    await prisma.shipment.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { email } });
    await prisma.$disconnect();
  });

  it('debería retornar los envíos del usuario autenticado', async () => {
    const response = await request(app)
      .get('/api/shipments/mine')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('peso');
    expect(response.body[0]).toHaveProperty('estado');
  });

  it('debería retornar 401 si no se envía token', async () => {
    const response = await request(app).get('/api/shipments/mine');
    expect(response.statusCode).toBe(401);
  });

  it('debería retornar 403 si el token es inválido', async () => {
    const response = await request(app)
      .get('/api/shipments/mine')
      .set('Authorization', 'Bearer token-falso');

    expect(response.statusCode).toBe(403);
  });
});
