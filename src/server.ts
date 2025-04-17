import express from 'express';
import authRoutes from './interfaces/routes/authRoutes';
import userRoutes from './interfaces/routes/userRoutes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

export const createServer = () => {
    const app = express();


    app.use(express.json());

    app.get('/ping', (_req, res) => {
        res.send('pong');
    });

    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Rutas
    app.use('/api/auth', authRoutes);
    app.use('/users', userRoutes);
    return app;
};
