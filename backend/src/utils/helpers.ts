import { v4 as uuidv4 } from 'uuid';

export const generateVerifyCode = (length = 6): string => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generateUUID = (): string => uuidv4();

export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const getExpiredAt = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

