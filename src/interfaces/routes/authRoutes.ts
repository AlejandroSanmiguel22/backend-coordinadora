import { Router } from 'express';
import { RegisterController } from '../controllers/RegisterController';
import { LoginController } from '../controllers/LoginController';

const router = Router();

router.post('/register', (req, res) => RegisterController.handle(req, res));

router.post('/login', (req, res) => LoginController.handle(req, res));

export default router;