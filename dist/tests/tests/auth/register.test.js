"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../src/server");
const prismaClient_1 = __importDefault(require("../../src/infrastructure/database/prismaClient"));
const app = (0, server_1.createServer)();
describe('POST /api/auth/register', () => {
    const email = 'test@example.com';
    const password = 'test1234';
    beforeAll(async () => {
        await prismaClient_1.default.user.deleteMany({ where: { email } });
    });
    afterAll(async () => {
        await prismaClient_1.default.$disconnect();
    });
    it('debería registrar un usuario exitosamente', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send({ email, password });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(email);
    });
    it('debería rechazar si el usuario ya existe', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send({ email, password });
        expect(response.status).toBe(409);
    });
    it('debería fallar si faltan campos', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send({ email: '' });
        expect(response.status).toBe(400);
    });
});
