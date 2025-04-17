"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const prismaClient_1 = __importDefault(require("../../infrastructure/database/prismaClient"));
class ProfileController {
    static async handle(req, res) {
        const userId = req.user?.userId;
        try {
            const user = await prismaClient_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ message: 'Error al obtener perfil de usuario', error });
        }
    }
}
exports.ProfileController = ProfileController;
