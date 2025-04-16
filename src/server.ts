import express from 'express';
import authRoutes from './interfaces/routes/authRoutes';


export const createServer = () => {
    const app = express();


    app.use(express.json());

    app.get('/ping', (_req, res) => {
        res.send('pong');
    });

    // Rutas
    app.use('/api/auth', authRoutes);

    return app;
};
