import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken, extractToken } from '../utils/jwt.util';
import { sendError, ErrorCodes } from '../utils/response.util';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      sendError(res, '未提供认证令牌', ErrorCodes.UNAUTHORIZED);
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      sendError(res, '无效或过期的认证令牌', ErrorCodes.UNAUTHORIZED);
      return;
    }

    req.userId = decoded.userId;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch {
    sendError(res, '认证失败', ErrorCodes.UNAUTHORIZED);
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = extractToken(req.headers.authorization);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.exp * 1000 >= Date.now()) {
        req.userId = decoded.userId;
        req.user = { userId: decoded.userId, email: decoded.email };
      }
    }
    next();
  } catch {
    next();
  }
};

