"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserSchema = void 0;
const zod_1 = require("zod");
exports.RegisterUserSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Email inválido' }),
    password: zod_1.z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});
