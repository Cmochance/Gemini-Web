import prisma from './prisma.service';
import { AppError } from '../middleware/error.middleware';
import { ErrorCodes } from '../utils/response.util';
import { IntegralType } from '../types';

class IntegralService {
  async addIntegral(userId: number, amount: number, type: IntegralType, remark?: string): Promise<number> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { integral: true } });
    if (!user) throw new AppError('用户不存在', ErrorCodes.USER_NOT_FOUND);

    const newBalance = user.integral + amount;

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { integral: newBalance } }),
      prisma.integralLog.create({ data: { userId, amount, balance: newBalance, type, remark } }),
    ]);

    return newBalance;
  }

  async deductIntegral(userId: number, amount: number, type: IntegralType, remark?: string): Promise<number> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { integral: true } });
    if (!user) throw new AppError('用户不存在', ErrorCodes.USER_NOT_FOUND);
    if (user.integral < amount) throw new AppError('积分不足', ErrorCodes.INSUFFICIENT_INTEGRAL);

    const newBalance = user.integral - amount;

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { integral: newBalance } }),
      prisma.integralLog.create({ data: { userId, amount: -amount, balance: newBalance, type, remark } }),
    ]);

    return newBalance;
  }

  async rechargeByKey(userId: number, key: string): Promise<number> {
    const card = await prisma.rechargeCard.findUnique({ where: { key } });
    if (!card) throw new AppError('充值卡密无效', ErrorCodes.INVALID_RECHARGE_KEY);
    if (card.used) throw new AppError('充值卡密已被使用', ErrorCodes.INVALID_RECHARGE_KEY);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { integral: true } });
    if (!user) throw new AppError('用户不存在', ErrorCodes.USER_NOT_FOUND);

    const newBalance = user.integral + card.integral;

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { integral: newBalance } }),
      prisma.integralLog.create({ data: { userId, amount: card.integral, balance: newBalance, type: IntegralType.RECHARGE, remark: '卡密充值' } }),
      prisma.rechargeCard.update({ where: { id: card.id }, data: { used: true, usedBy: userId, usedAt: new Date() } }),
    ]);

    return newBalance;
  }

  async checkSufficient(userId: number, isImage = false): Promise<boolean> {
    const required = isImage ? parseInt(process.env.IMAGE_CONSUME_INTEGRAL || '8') : parseInt(process.env.CHAT_CONSUME_INTEGRAL || '1');
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { integral: true, vipUser: true } });
    if (!user) throw new AppError('用户不存在', ErrorCodes.USER_NOT_FOUND);
    if (user.vipUser) return true;
    return user.integral >= required;
  }

  async consume(userId: number, isImage = false): Promise<number> {
    const amount = isImage ? parseInt(process.env.IMAGE_CONSUME_INTEGRAL || '8') : parseInt(process.env.CHAT_CONSUME_INTEGRAL || '1');
    return await this.deductIntegral(userId, amount, IntegralType.CONSUME, isImage ? '图片生成' : '对话消耗');
  }
}

export default new IntegralService();

