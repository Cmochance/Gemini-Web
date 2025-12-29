import prisma from './prisma.service';
import { AppError } from '../middleware/error.middleware';
import { ErrorCodes } from '../utils/response.util';
import { CreateOrderDto, OrderResult, OrderStatus, PRODUCTS, IntegralType } from '../types';

class PaymentService {
  async createOrder(userId: number, dto: CreateOrderDto): Promise<OrderResult> {
    const product = PRODUCTS[dto.productType];
    if (!product) throw new AppError('无效的产品类型', ErrorCodes.VALIDATION_ERROR);

    const order = await prisma.order.create({
      data: {
        userId,
        productType: dto.productType,
        productName: product.name,
        amount: product.price,
        integral: product.integral,
        payType: dto.payType,
        status: OrderStatus.TO_PAY,
      },
    });

    const qrCode = `https://qr.alipay.com/order_${order.id}_${Date.now()}`;
    await prisma.order.update({ where: { id: order.id }, data: { qrCode } });

    return { orderId: order.id, qrCode };
  }

  async getOrderStatus(orderId: number, userId: number): Promise<OrderStatus> {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new AppError('订单不存在', ErrorCodes.ORDER_NOT_FOUND);
    return order.status as OrderStatus;
  }

  async confirmPayment(orderId: number, userId: number): Promise<OrderStatus> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { user: true },
    });

    if (!order) throw new AppError('订单不存在', ErrorCodes.ORDER_NOT_FOUND);
    if (order.status === OrderStatus.PAID) return OrderStatus.PAID;
    if (order.status === OrderStatus.CANCELLED) throw new AppError('订单已取消', ErrorCodes.ORDER_NOT_FOUND);

    // 模拟支付成功
    const newBalance = order.user.integral + order.integral;

    await prisma.$transaction([
      prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.PAID, paidAt: new Date() } }),
      prisma.user.update({ where: { id: order.userId }, data: { integral: newBalance } }),
      prisma.integralLog.create({
        data: { userId: order.userId, amount: order.integral, balance: newBalance, type: IntegralType.RECHARGE, remark: `购买${order.productName}` },
      }),
    ]);

    return OrderStatus.PAID;
  }
}

export default new PaymentService();

