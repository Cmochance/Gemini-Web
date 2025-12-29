import jwt from 'jsonwebtoken';
import { JwtPayload, UserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  return authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
};

