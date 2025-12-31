import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';

// 使用绝对路径加载 .env 文件
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 31001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:30000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (always enabled for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.body) {
    console.log('[Request Body]', JSON.stringify(req.body).substring(0, 500));
  }
  next();
});

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Gemini Web Backend`);
  console.log('='.repeat(50));
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api/v1`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n📴 ${signal} received. Shutting down...`);
  server.close(async () => {
    try {
      const prisma = require('./services/prisma.service').default;
      await prisma.$disconnect();
      const redis = require('./services/redis.service').default;
      await redis.close();
    } catch { }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;

