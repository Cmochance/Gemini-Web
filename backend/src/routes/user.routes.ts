import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.get('/profile', authenticate, asyncHandler((req, res) => userController.getProfile(req as any, res)));
router.put('/profile', authenticate, asyncHandler((req, res) => userController.updateProfile(req as any, res)));
router.get('/integral', authenticate, asyncHandler((req, res) => userController.getIntegral(req as any, res)));

export default router;

