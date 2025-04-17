"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./interfaces/routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./interfaces/routes/userRoutes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const createServer = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/ping', (_req, res) => {
        res.send('pong');
    });
    app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
    // Rutas
    app.use('/api/auth', authRoutes_1.default);
    app.use('/users', userRoutes_1.default);
    return app;
};
exports.createServer = createServer;
