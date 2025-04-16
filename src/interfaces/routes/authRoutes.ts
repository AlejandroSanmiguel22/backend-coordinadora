import { Router } from 'express';
import { RegisterController } from '../controllers/RegisterController';

const router = Router();

router.post('/register', (req, res) => RegisterController.handle(req, res));

export default router;