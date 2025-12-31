import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// 确保在初始化 Prisma 之前加载环境变量,使用绝对路径
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

