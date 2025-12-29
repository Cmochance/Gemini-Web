import bcrypt from 'bcrypt';
import prisma from './prisma.service';
import redisService from './redis.service';
import emailService from './email.service';
import { generateToken } from '../utils/jwt.util';
import { generateVerifyCode, generateInviteCode } from '../utils/helpers';
import { AppError } from '../middleware/error.middleware';
import { ErrorCodes } from '../utils/response.util';
import { LoginDto, RegisterDto } from '../types';

class AuthService {
  async login(dto: LoginDto): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new AppError('用户不存在', ErrorCodes.USER_NOT_FOUND);

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new AppError('密码错误', ErrorCodes.INVALID_PASSWORD);

    return generateToken({ userId: user.id, email: user.email });
  }

  async register(dto: RegisterDto): Promise<string> {
    const savedCode = await redisService.getVerifyCode(dto.email, 'register');
    if (!savedCode || savedCode !== dto.code) {
      throw new AppError('验证码错误或已过期', ErrorCodes.INVALID_CODE);
    }

    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new AppError('该邮箱已被注册', ErrorCodes.USER_ALREADY_EXISTS);

    let inviter = null;
    if (dto.inviteCode) {
      inviter = await prisma.user.findUnique({ where: { inviteCode: dto.inviteCode } });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const giftIntegral = parseInt(process.env.REGISTER_GIFT_INTEGRAL || '10');

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        inviteCode: generateInviteCode(),
        invitedBy: dto.inviteCode || null,
        integral: giftIntegral,
      },
    });

    await prisma.integralLog.create({
      data: { userId: user.id, amount: giftIntegral, balance: giftIntegral, type: 'register', remark: '注册赠送' },
    });

    if (inviter) {
      const reward = parseInt(process.env.INVITE_REWARD_INTEGRAL || '50');
      await prisma.user.update({ where: { id: inviter.id }, data: { integral: { increment: reward } } });
      await prisma.integralLog.create({
        data: { userId: inviter.id, amount: reward, balance: inviter.integral + reward, type: 'invite', remark: `邀请用户: ${dto.email}` },
      });
    }

    await redisService.delVerifyCode(dto.email, 'register');
    return generateToken({ userId: user.id, email: user.email });
  }

  async sendVerifyCode(email: string, type = 'register'): Promise<void> {
    const canSend = await redisService.checkSendLimit(email, type);
    if (!canSend) throw new AppError('验证码发送过于频繁', 429);

    if (type === 'register') {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new AppError('该邮箱已被注册', ErrorCodes.USER_ALREADY_EXISTS);
    }

    const code = generateVerifyCode(6);
    await redisService.setVerifyCode(email, code, type);
    await redisService.setSendLimit(email, type, 60);
    await emailService.sendVerifyCode(email, code);
  }
}

export default new AuthService();

