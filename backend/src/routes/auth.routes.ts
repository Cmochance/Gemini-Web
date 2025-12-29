import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { loginLimiter, sendCodeLimiter } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.post('/login', loginLimiter, asyncHandler((req, res) => authController.login(req, res)));
router.post('/register', asyncHandler((req, res) => authController.register(req, res)));
router.post('/verify/send_code', sendCodeLimiter, asyncHandler((req, res) => authController.sendCode(req, res)));
router.post('/logout', asyncHandler((req, res) => authController.logout(req, res)));

export default router;

