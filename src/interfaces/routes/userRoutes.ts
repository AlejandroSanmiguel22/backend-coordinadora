import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para usuarios autenticados
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario retornado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido
 */
router.get('/profile', authenticateToken, ProfileController.handle);

export default router;
