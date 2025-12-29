import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { validate, createOrderSchema } from '../utils/validator.util';
import { AuthRequest, CreateOrderDto } from '../types';

class PaymentController {
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    const validation = validate(createOrderSchema, req.body);
    if (!validation.success) { sendError(res, validation.error, 400); return; }

    try {
      const result = await paymentService.createOrder(req.userId!, validation.data as CreateOrderDto);
      sendSuccess(res, result, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async getOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.query.orderId as string);
      if (!orderId) { sendError(res, '订单ID不能为空', 400); return; }
      const status = await paymentService.getOrderStatus(orderId, req.userId!);
      sendSuccess(res, status, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async confirmPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;
      if (!orderId) { sendError(res, '订单ID不能为空', 400); return; }
      const status = await paymentService.confirmPayment(orderId, req.userId!);
      sendSuccess(res, status, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async handleNotify(req: Request, res: Response): Promise<void> {
    console.log('[Payment] Notify:', req.body);
    res.send('success');
  }
}

export default new PaymentController();

