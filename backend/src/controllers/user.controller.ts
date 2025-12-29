import { Request, Response } from 'express';
import userService from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest } from '../types';
import prisma from '../services/prisma.service';

class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = await userService.getProfile(req.userId!);
      sendSuccess(res, profile, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nickName, avatar, description } = req.body;
      const profile = await userService.updateProfile(req.userId!, { nickName, avatar, description });
      sendSuccess(res, profile, '更新成功');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async getIntegral(req: AuthRequest, res: Response): Promise<void> {
    try {
      const integral = await userService.getIntegral(req.userId!);
      sendSuccess(res, { integral }, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  // ========== Admin: User Management ==========

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = Math.min(parseInt(req.query.size as string) || 20, 100);
      const search = req.query.search as string;

      const where = search ? { email: { contains: search } } : {};
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: { id: true, email: true, nickName: true, integral: true, vipUser: true, isAdmin: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * size,
          take: size,
        }),
        prisma.user.count({ where }),
      ]);

      sendSuccess(res, { users, total, page, size }, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async setUserFreeStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const { vipUser } = req.body;

      if (typeof vipUser !== 'boolean') {
        sendError(res, '请提供 vipUser (boolean)', 400);
        return;
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { vipUser },
        select: { id: true, email: true, vipUser: true },
      });

      sendSuccess(res, user, vipUser ? '已授予永久免费权限' : '已取消永久免费权限');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async setUserAdminStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const { isAdmin } = req.body;

      if (typeof isAdmin !== 'boolean') {
        sendError(res, '请提供 isAdmin (boolean)', 400);
        return;
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isAdmin },
        select: { id: true, email: true, isAdmin: true },
      });

      sendSuccess(res, user, isAdmin ? '已授予管理员权限' : '已取消管理员权限');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async addUserIntegral(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const { amount, remark } = req.body;

      if (typeof amount !== 'number' || amount <= 0) {
        sendError(res, '请提供有效的 amount (正整数)', 400);
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { integral: true } });
      if (!user) {
        sendError(res, '用户不存在', 404);
        return;
      }

      const newBalance = user.integral + amount;
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { integral: newBalance } }),
        prisma.integralLog.create({ data: { userId, amount, balance: newBalance, type: 'admin', remark: remark || '管理员充值' } }),
      ]);

      sendSuccess(res, { userId, integral: newBalance }, '积分已添加');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }
}

export default new UserController();

