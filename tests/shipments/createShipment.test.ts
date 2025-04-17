import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createServer();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('POST /api/shipments', () => {
  const email = 'shipmentuser@example.com';
  const password = 'clave123';
  const userName = 'shipmentuser';
  let token: string;
  let userId: number;

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
  });

  afterAll(async () => {
    await prisma.shipment.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { email } });
    await prisma.$disconnect();
  });

  it('debería crear un envío exitosamente', async () => {
    const response = await request(app)
      .post('/api/shipments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        peso: 1.5,
        dimensiones: '20x30x10',
        tipoProducto: 'Ropa',
        direccion: 'Carrera 7 #55-21, Bogotá',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      peso: 1.5,
      dimensiones: '20x30x10',
      tipoProducto: 'Ropa',
      direccion: 'Carrera 7 #55-21, Bogotá',
      estado: 'En espera',
      userId,
    });
  });

  it('debería rechazar si falta el token', async () => {
    const response = await request(app).post('/api/shipments').send({
      peso: 1.5,
      dimensiones: '20x30x10',
      tipoProducto: 'Ropa',
      direccion: 'Carrera 7 #55-21, Bogotá',
    });

    expect(response.statusCode).toBe(401);
  });

  it('debería rechazar si los datos están incompletos', async () => {
    const response = await request(app)
      .post('/api/shipments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        peso: 2.0,
        tipoProducto: 'Electrónica',
        // Falta dirección y dimensiones
      });

    expect(response.statusCode).toBe(400);
  });
});
