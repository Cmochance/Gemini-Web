import { Request } from 'express';

// =================== 认证类型 ===================
export interface AuthRequest extends Request {
  userId?: number;
  user?: UserPayload;
}

export interface UserPayload {
  userId: number;
  email: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

// =================== 用户类型 ===================
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  code: string;
  inviteCode?: string;
}

export interface UserProfile {
  avatar: string;
  name: string;
  email: string;
  description: string;
  integral: number;
  inviteCode: string;
  nickName?: string;
  vipUser?: boolean;
}

// =================== 模型类型 ===================
export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  type: 'chat' | 'image' | 'embedding' | 'other';
  supportsStream: boolean;
}

// =================== 聊天类型 ===================
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  messageId?: string;
}

export interface ChatCompletionDto {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
  max_tokens?: number;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
}

export interface ImageGenerationDto {
  prompt: string;
  model?: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  responseFormat?: 'url' | 'b64_json';
}

export interface ImageOperateDto {
  action: string;
  taskId: string;
  index?: number;
}

// =================== 积分类型 ===================
export interface RechargeDto {
  key: string;
}

export enum IntegralType {
  REGISTER = 'register',
  INVITE = 'invite',
  RECHARGE = 'recharge',
  CONSUME = 'consume',
  REFUND = 'refund',
  GIFT = 'gift',
}

// =================== 支付类型 ===================
export interface CreateOrderDto {
  payType: 'alipay';
  productType: 1 | 2 | 3;
}

export interface OrderResult {
  orderId: number;
  qrCode: string;
}

export enum OrderStatus {
  NULL = 0,
  TO_PAY = 1,
  PAID = 2,
  CANCELLED = 3,
  REFUNDED = 4,
}

export const PRODUCTS: Record<number, { name: string; price: number; integral: number }> = {
  1: { name: '基础版', price: 10, integral: 100 },
  2: { name: '高级版', price: 30, integral: 500 },
  3: { name: '尊享版', price: 100, integral: 2000 },
};

// =================== API 响应类型 ===================
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

