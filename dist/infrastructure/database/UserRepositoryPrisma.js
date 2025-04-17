"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryPrisma = void 0;
const prismaClient_1 = __importDefault(require("./prismaClient"));
class UserRepositoryPrisma {
    async create(user) {
        const createdUser = await prismaClient_1.default.user.create({ data: user });
        return { ...createdUser, role: createdUser.role ?? undefined };
    }
    async findByEmail(email) {
        const foundUser = await prismaClient_1.default.user.findUnique({ where: { email } });
        return foundUser ? { ...foundUser, role: foundUser.role ?? undefined } : null;
    }
}
exports.UserRepositoryPrisma = UserRepositoryPrisma;
