import { Router } from 'express';
import { CreateShipmentController } from '../controllers/CreateShipmentController';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/shipments:
 *   post:
 *     summary: Registrar un nuevo envío
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - peso
 *               - dimensiones
 *               - tipoProducto
 *               - direccion
 *             properties:
 *               peso:
 *                 type: number
 *               dimensiones:
 *                 type: string
 *               tipoProducto:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Envío creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticateToken, CreateShipmentController.handle);

export default router;
