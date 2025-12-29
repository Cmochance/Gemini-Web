import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
    getOpenAIConfig,
    updateOpenAIConfig,
    getSmtpConfig,
    updateSmtpConfig,
    testSmtpConfig,
} from '../controllers/config.controller';

const router = Router();

// All routes require auth + admin
router.use(authenticate, requireAdmin);

// OpenAI config
router.get('/openai', getOpenAIConfig);
router.put('/openai', updateOpenAIConfig);

// SMTP config
router.get('/smtp', getSmtpConfig);
router.put('/smtp', updateSmtpConfig);
router.post('/smtp/test', testSmtpConfig);

export default router;
