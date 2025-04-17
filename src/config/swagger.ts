const swaggerJSDoc = require('swagger-jsdoc');

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coordinadora API',
      version: '1.0.0',
      description: 'Documentación de la API de logística',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/interfaces/routes/*.ts']
});
