"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tests/auth/login.test.ts
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../src/server");
const prismaClient_1 = __importDefault(require("../../src/infrastructure/database/prismaClient"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Configuración inicial
const app = (0, server_1.createServer)();
const TEST_EMAIL = 'testlogin@example.com';
const TEST_PASSWORD = 'clave123';
describe('POST /api/auth/login', () => {
    beforeAll(async () => {
        // Crear usuario de prueba
        await prismaClient_1.default.user.upsert({
            where: { email: TEST_EMAIL },
            update: {},
            create: {
                email: TEST_EMAIL,
                password: await bcrypt_1.default.hash(TEST_PASSWORD, 10),
                role: 'admin'
            }
        });
    });
    afterAll(async () => {
        // Limpiar base de datos
        await prismaClient_1.default.user.deleteMany({
            where: { email: { in: [TEST_EMAIL, 'noexiste@example.com'] } }
        });
        await prismaClient_1.default.$disconnect();
    });
    it('debería iniciar sesión exitosamente con credenciales válidas', async () => {
        const response = await (0, supertest_1.default)(app)
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
        const response = await (0, supertest_1.default)(app)
            .post('/api/auth/login')
            .send({
            email: TEST_EMAIL,
            password: 'contraseña-incorrecta'
        });
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message');
    });
    it('debería fallar con email no registrado', async () => {
        const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(body);
            expect(response.statusCode).toBe(400);
        }
    });
});
