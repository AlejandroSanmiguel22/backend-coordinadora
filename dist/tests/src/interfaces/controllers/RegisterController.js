"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const RegisterUserDto_1 = require("../dto/RegisterUserDto");
const UserRepositoryPrisma_1 = require("../../infrastructure/database/UserRepositoryPrisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
class RegisterController {
    static async handle(req, res) {
        const result = RegisterUserDto_1.RegisterUserSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.flatten().fieldErrors });
            return;
        }
        const { email, password } = result.data;
        try {
            const userRepository = new UserRepositoryPrisma_1.UserRepositoryPrisma();
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                res.status(409).json({ message: 'El usuario ya existe' });
                return;
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const user = await userRepository.create({ email, password: hashedPassword });
            res.status(201).json({ id: user.id, email: user.email });
        }
        catch (error) {
            res.status(500).json({ message: 'Error al registrar usuario', error });
        }
    }
}
exports.RegisterController = RegisterController;
