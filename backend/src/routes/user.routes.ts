import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// User profile routes
router.get('/profile', authenticate, asyncHandler((req, res) => userController.getProfile(req as any, res)));
router.put('/profile', authenticate, asyncHandler((req, res) => userController.updateProfile(req as any, res)));
router.get('/integral', authenticate, asyncHandler((req, res) => userController.getIntegral(req as any, res)));

// Admin: User management routes
router.get('/list', authenticate, requireAdmin, asyncHandler((req, res) => userController.listUsers(req, res)));
router.put('/:userId/free', authenticate, requireAdmin, asyncHandler((req, res) => userController.setUserFreeStatus(req, res)));
router.put('/:userId/admin', authenticate, requireAdmin, asyncHandler((req, res) => userController.setUserAdminStatus(req, res)));
router.post('/:userId/integral', authenticate, requireAdmin, asyncHandler((req, res) => userController.addUserIntegral(req, res)));

export default router;

