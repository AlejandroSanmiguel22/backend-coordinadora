"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RegisterController_1 = require("../controllers/RegisterController");
const LoginController_1 = require("../controllers/LoginController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       409:
 *         description: El usuario ya existe
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/register', (req, res) => RegisterController_1.RegisterController.handle(req, res));
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               userName:
 *                type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token y rol retornados correctamente
 *       401:
 *         description: Credenciales inválidas
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/login', (req, res) => LoginController_1.LoginController.handle(req, res));
exports.default = router;
