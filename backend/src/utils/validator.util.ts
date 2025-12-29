import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8位'),
});

export const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8位')
    .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[A-Za-z0-9]+$/, '密码必须包含数字和字母'),
  code: z.string().length(6, '验证码为6位'),
  inviteCode: z.string().optional(),
});

export const sendCodeSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
});

export const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1, '消息内容不能为空'),
  }).passthrough()),
  model: z.string().optional(),
  stream: z.boolean().optional(),
  max_tokens: z.number().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().min(0).max(2).optional(),
}).passthrough();

export const imageSchema = z.object({
  prompt: z.string().min(1, '提示词不能为空'),
  model: z.string().optional(),
  n: z.number().min(1).max(4).optional(),
  size: z.enum(['256x256', '512x512', '1024x1024']).optional(),
});

export const imageOperateSchema = z.object({
  action: z.string().min(1),
  taskId: z.string().min(1),
  index: z.number().optional(),
});

export const createOrderSchema = z.object({
  payType: z.enum(['alipay']),
  productType: z.number().min(1).max(3),
});

export const rechargeSchema = z.object({
  key: z.string().min(1, '充值卡密不能为空'),
});

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  if (result.success) return { success: true as const, data: result.data };
  return { success: false as const, error: result.error.errors.map(e => e.message).join(', ') };
};

