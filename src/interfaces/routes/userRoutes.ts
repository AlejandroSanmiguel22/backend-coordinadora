import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/profile', authenticateToken, ProfileController.handle);

export default router;
