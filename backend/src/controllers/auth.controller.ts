import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { validate, loginSchema, registerSchema, sendCodeSchema } from '../utils/validator.util';
import { AuthRequest, LoginDto, RegisterDto } from '../types';

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const validation = validate(loginSchema, req.body);
    if (!validation.success) { sendError(res, validation.error, 400); return; }

    try {
      const token = await authService.login(validation.data as LoginDto);
      res.cookie('authorization', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
      sendSuccess(res, token, '登录成功');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    const validation = validate(registerSchema, req.body);
    if (!validation.success) { sendError(res, validation.error, 400); return; }

    try {
      const token = await authService.register(validation.data as RegisterDto);
      res.cookie('authorization', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
      sendSuccess(res, token, '注册成功');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async sendCode(req: Request, res: Response): Promise<void> {
    const validation = validate(sendCodeSchema, req.body);
    if (!validation.success) { sendError(res, validation.error, 400); return; }

    try {
      await authService.sendVerifyCode(validation.data.email, req.body.type || 'register');
      sendSuccess(res, null, '验证码已发送');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.cookie('authorization', '', { httpOnly: true, maxAge: 0, path: '/' });
    sendSuccess(res, null, '登出成功');
  }
}

export default new AuthController();

