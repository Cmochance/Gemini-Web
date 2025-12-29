import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 31001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:30000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

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
    } catch {}
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;

