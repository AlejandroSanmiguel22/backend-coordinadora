// tests/auth/login.test.ts
import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';

// Configuración inicial
const app = createServer();
const TEST_EMAIL = 'testlogin@example.com';
const TEST_PASSWORD = 'clave123';

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    // Crear usuario de prueba
    await prisma.user.upsert({
      where: { email: TEST_EMAIL },
      update: {},
      create: {
        email: TEST_EMAIL,
        password: await bcrypt.hash(TEST_PASSWORD, 10),
        role: 'admin'
      }
    });
  });

  afterAll(async () => {
    // Limpiar base de datos
    await prisma.user.deleteMany({
      where: { email: { in: [TEST_EMAIL, 'noexiste@example.com'] } }
    });
    await prisma.$disconnect();
  });

  it('debería iniciar sesión exitosamente con credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ 
        email: TEST_EMAIL, 
        password: TEST_PASSWORD 
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      token: expect.any(String),
      role: 'admin'
    });
  });

  it('debería fallar con contraseña incorrecta', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ 
        email: TEST_EMAIL, 
        password: 'contraseña-incorrecta' 
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('debería fallar con email no registrado', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ 
        email: 'noexiste@example.com', 
        password: TEST_PASSWORD 
      });

    expect(response.statusCode).toBe(401);
  });

  it('debería requerir email y contraseña', async () => {
    const tests = [
      { password: TEST_PASSWORD },
      { email: TEST_EMAIL },
      {}
    ];

    for (const body of tests) {
      const response = await request(app)
        .post('/api/auth/login')
        .send(body);

      expect(response.statusCode).toBe(400);
    }
  });
});