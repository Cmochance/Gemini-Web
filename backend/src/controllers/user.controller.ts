import { Response } from 'express';
import userService from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest } from '../types';

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
}

export default new UserController();

