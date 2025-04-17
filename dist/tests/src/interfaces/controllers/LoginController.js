"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const LoginUserDto_1 = require("../dto/LoginUserDto");
const UserRepositoryPrisma_1 = require("../../infrastructure/database/UserRepositoryPrisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';
class LoginController {
    static async handle(req, res) {
        const result = LoginUserDto_1.LoginUserSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.flatten().fieldErrors });
            return;
        }
        const { email, password } = result.data;
        try {
            const userRepository = new UserRepositoryPrisma_1.UserRepositoryPrisma();
            const user = await userRepository.findByEmail(email);
            if (!user) {
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }
            const passwordMatch = await bcrypt_1.default.compare(password, user.password);
            if (!passwordMatch) {
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({
                token,
                role: user.role
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error al iniciar sesión', error });
        }
    }
}
exports.LoginController = LoginController;
