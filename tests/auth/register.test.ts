import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';

const app = createServer();

describe('POST /api/auth/register', () => {
  const email = 'test@example.com';
  const password = 'test1234';

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debería registrar un usuario exitosamente', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(email);
  });

  it('debería rechazar si el usuario ya existe', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    expect(response.status).toBe(409);
  });

  it('debería fallar si faltan campos', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: '' });

    expect(response.status).toBe(400);
  });
});
