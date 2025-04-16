import express from 'express';

export const createServer = () => {
    const app = express();


    app.use(express.json());

    app.get('/ping', (_req, res) => {
        res.send('pong');
    });

    return app;
};
