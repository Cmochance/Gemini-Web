import { Router } from 'express';
import conversationController from '../controllers/conversation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.get('/', authenticate, asyncHandler((req, res) => conversationController.getAll(req as any, res)));
router.post('/', authenticate, asyncHandler((req, res) => conversationController.create(req as any, res)));
router.put('/:uuid', authenticate, asyncHandler((req, res) => conversationController.update(req as any, res)));
router.delete('/:uuid', authenticate, asyncHandler((req, res) => conversationController.delete(req as any, res)));

export default router;
