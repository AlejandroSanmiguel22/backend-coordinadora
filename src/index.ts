import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './server';
import { connectRedis } from './infrastructure/cache/redisClient';

const PORT = process.env.PORT || 3000;

const app = createServer();

connectRedis()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar con Redis:', err);
  });

