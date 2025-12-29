import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import integralRoutes from './integral.routes';
import paymentRoutes from './payment.routes';
import configRoutes from './config.routes';

const router = Router();

router.use('/user', authRoutes);
router.use('/user', userRoutes);
router.use('/openai/v1', chatRoutes);
router.use('/integral', integralRoutes);
router.use('/pay', paymentRoutes);
router.use('/config', configRoutes);

export default router;

