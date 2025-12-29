import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError, ErrorCodes } from '../utils/response.util';

export class AppError extends Error {
  constructor(public message: string, public code: number = ErrorCodes.UNKNOWN_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  if (err instanceof ZodError) {
    sendError(res, err.errors.map(e => e.message).join(', '), ErrorCodes.VALIDATION_ERROR);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.code);
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      sendError(res, '数据已存在', ErrorCodes.USER_ALREADY_EXISTS);
      return;
    }
  }

  sendError(res, process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message, ErrorCodes.UNKNOWN_ERROR);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `接口不存在: ${req.method} ${req.path}`, ErrorCodes.NOT_FOUND);
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

