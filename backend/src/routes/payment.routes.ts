import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { paymentLimiter } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.post('/pre_create', authenticate, paymentLimiter, asyncHandler((req, res) => paymentController.createOrder(req as any, res)));
router.get('/status', authenticate, asyncHandler((req, res) => paymentController.getOrderStatus(req as any, res)));
router.post('/confirm', authenticate, asyncHandler((req, res) => paymentController.confirmPayment(req as any, res)));
router.post('/notify', asyncHandler((req, res) => paymentController.handleNotify(req, res)));

export default router;

