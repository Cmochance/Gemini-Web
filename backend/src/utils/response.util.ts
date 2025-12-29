import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T = any>(res: Response, data: T, msg = 'success'): Response => {
  const response: ApiResponse<T> = { code: 0, data, msg };
  return res.json(response);
};

export const success = <T = any>(data: T, msg = 'success'): ApiResponse<T> => {
  return { code: 0, data, msg };
};

export const sendError = (res: Response, msg: string, code = 1, data: any = null): Response => {
  const response: ApiResponse = { code, data, msg };
  return res.json(response);
};

export const ErrorCodes = {
  UNKNOWN_ERROR: 500,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  USER_NOT_FOUND: 1001,
  USER_ALREADY_EXISTS: 1002,
  INVALID_PASSWORD: 1003,
  INVALID_CODE: 1004,
  INSUFFICIENT_INTEGRAL: 2001,
  INVALID_RECHARGE_KEY: 2002,
  ORDER_NOT_FOUND: 3001,
  AI_SERVICE_ERROR: 4001,
};

