import { Router } from 'express';
import integralController from '../controllers/integral.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.post('/recharge', authenticate, asyncHandler((req, res) => integralController.recharge(req as any, res)));
router.get('/balance', authenticate, asyncHandler((req, res) => integralController.getBalance(req as any, res)));

export default router;

