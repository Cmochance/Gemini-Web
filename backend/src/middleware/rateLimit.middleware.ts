import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs: number, max: number, message: string) => rateLimit({
  windowMs,
  max,
  message: { code: 429, data: null, msg: message },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = createLimiter(60 * 1000, 60, '请求过于频繁');
export const loginLimiter = createLimiter(60 * 1000, 5, '登录尝试次数过多');
export const sendCodeLimiter = createLimiter(60 * 1000, 1, '验证码发送过于频繁');
export const chatLimiter = createLimiter(60 * 1000, 20, '请求过于频繁');
export const paymentLimiter = createLimiter(60 * 1000, 10, '请求过于频繁');

