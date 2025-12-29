import { Response } from 'express';
import integralService from '../services/integral.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { validate, rechargeSchema } from '../utils/validator.util';
import { AuthRequest } from '../types';

class IntegralController {
  async recharge(req: AuthRequest, res: Response): Promise<void> {
    const validation = validate(rechargeSchema, req.body);
    if (!validation.success) { sendError(res, validation.error, 400); return; }

    try {
      const newBalance = await integralService.rechargeByKey(req.userId!, validation.data.key);
      sendSuccess(res, { integral: newBalance }, '充值成功');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async getBalance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const prisma = require('../services/prisma.service').default;
      const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { integral: true } });
      sendSuccess(res, { integral: user?.integral || 0 }, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }
}

export default new IntegralController();

