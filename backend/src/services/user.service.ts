import prisma from './prisma.service';
import { AppError } from '../middleware/error.middleware';
import { ErrorCodes } from '../utils/response.util';
import { UserProfile } from '../types';

class UserService {
  async getProfile(userId: number): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, nickName: true, avatar: true, description: true, integral: true, inviteCode: true, vipUser: true },
    });

    if (!user) throw new AppError('用户不存在', ErrorCodes.USER_NOT_FOUND);

    return {
      avatar: user.avatar || '/author.jpg',
      name: user.nickName || '',
      email: user.email,
      description: user.description || '',
      integral: user.integral,
      inviteCode: user.inviteCode,
      nickName: user.nickName || undefined,
      vipUser: user.vipUser,
    };
  }

  async updateProfile(userId: number, data: Partial<{ nickName: string; avatar: string; description: string }>): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { email: true, nickName: true, avatar: true, description: true, integral: true, inviteCode: true, vipUser: true },
    });

    return {
      avatar: user.avatar || '/author.jpg',
      name: user.nickName || '',
      email: user.email,
      description: user.description || '',
      integral: user.integral,
      inviteCode: user.inviteCode,
      nickName: user.nickName || undefined,
      vipUser: user.vipUser,
    };
  }

  async getIntegral(userId: number): Promise<number> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { integral: true } });
    if (!user) throw new AppError('用户不存在', ErrorCodes.USER_NOT_FOUND);
    return user.integral;
  }
}

export default new UserService();

