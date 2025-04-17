/// <reference types="jest" />

import request from 'supertest';
import { createServer } from '../../src/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createServer();

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

describe('GET /users/profile', () => {
  const email = 'profiletest@example.com';
  const password = 'clave123';
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
        userName: 'testprofile',
        role: 'admin'
      }
    });


    userId = user.id;
    token = jwt.sign({ userId, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('debería retornar perfil del usuario con token válido', async () => {
    const response = await request(app)
      .get('/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: userId,
      email,
      role: 'admin',
      createdAt: expect.any(String)
    });
  });

  it('debería retornar 401 si no se envía token', async () => {
    const response = await request(app).get('/users/profile');
    expect(response.statusCode).toBe(401);
  });

  it('debería retornar 403 si el token es inválido', async () => {
    const response = await request(app)
      .get('/users/profile')
      .set('Authorization', 'Bearer token-falso');

    expect(response.statusCode).toBe(403);
  });
});
