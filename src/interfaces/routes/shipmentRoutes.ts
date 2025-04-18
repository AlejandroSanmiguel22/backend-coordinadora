import { Router } from 'express';
import { CreateShipmentController } from '../controllers/CreateShipmentController';
import { GetMyShipmentsController } from '../controllers/GetMyShipmentsController';
import { authenticateToken, authorizeRole } from '../../middlewares/authMiddleware';
import { AssignShipmentController } from '../controllers/AssignShipmentController';
import { GetAllShipmentsController } from '../controllers/GetAllShipmentsController';
import { GetRoutesController } from '../controllers/GetRoutesController';
import { GetShipmentStatusController } from '../controllers/GetShipmentStatusController';


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

/**
 * @swagger
 * /api/shipments/mine:
 *   get:
 *     summary: Obtener los envíos del usuario autenticado
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de envíos del usuario
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/mine', authenticateToken, GetMyShipmentsController.handle);


/**
 * @swagger
 * /api/shipments/{id}/assign:
 *   put:
 *     summary: Asignar una ruta a un envío
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del envío a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - routeId
 *             properties:
 *               routeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Envío actualizado correctamente
 *       400:
 *         description: Datos inválidos o transportista no disponible
 *       401:
 *         description: Usuario no autenticado
 */
router.put('/:id/assign', authenticateToken, authorizeRole(['admin']), AssignShipmentController.handle);


/**
 * @swagger
 * /api/shipments:
 *   get:
 *     summary: Obtener todos los envíos
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los envíos
 *       401:
 *         description: Usuario no autenticado
 */
router.get('/', authenticateToken, authorizeRole(['admin']), GetAllShipmentsController.handle);


/**
 * @swagger
 * /api/shipments/routes:
 *   get:
 *     summary: Obtener todas las rutas con el transportista
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutas con el transportista
 *       401:
 *         description: Usuario no autenticado
 */

router.get('/routes', authenticateToken, authorizeRole(['admin']), GetRoutesController.handle);



/**
 * @swagger
 * /api/shipments/{id}/status:
 *   get:
 *     summary: Obtener el estado de un envío
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del envío a consultar
 *     responses:
 *       200:
 *         description: Estado del envío
 *       400:
 *         description: ID de envío inválido
 *       401:
 *         description: Usuario no autenticado
 */
router.get('/:id/status', authenticateToken, GetShipmentStatusController.handle);

export default router;
