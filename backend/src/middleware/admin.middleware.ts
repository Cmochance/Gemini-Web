import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import prisma from '../services/prisma.service';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            throw new AppError('未登录', 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isAdmin: true },
        });

        if (!user || !user.isAdmin) {
            throw new AppError('需要管理员权限', 403);
        }

        next();
    } catch (error) {
        next(error);
    }
};
