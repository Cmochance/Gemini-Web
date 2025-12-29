import { Router } from 'express';
import chatController from '../controllers/chat.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { chatLimiter } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.get('/models', optionalAuth, asyncHandler((req, res) => chatController.getModels(req, res)));
router.get('/config', optionalAuth, asyncHandler((req, res) => chatController.getConfig(req, res)));
router.post('/chat/completions', authenticate, chatLimiter, asyncHandler((req, res) => chatController.chatCompletions(req as any, res)));
router.post('/image', authenticate, chatLimiter, asyncHandler((req, res) => chatController.generateImage(req as any, res)));
router.post('/image/operate', authenticate, chatLimiter, asyncHandler((req, res) => chatController.operateImage(req as any, res)));

export default router;

