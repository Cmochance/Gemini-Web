import { Response } from 'express';
import conversationService from '../services/conversation.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest } from '../types';

class ConversationController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const conversations = await conversationService.getAll(req.userId!);
      sendSuccess(res, conversations, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { uuid, title } = req.body;
      if (!uuid) {
        sendError(res, 'uuid is required', 400);
        return;
      }

      const conversation = await conversationService.create({
        userId: req.userId!,
        uuid,
        title,
      });
      sendSuccess(res, conversation, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const { title } = req.body;

      if (!title) {
        sendError(res, 'title is required', 400);
        return;
      }

      await conversationService.update(req.userId!, Number(uuid), title);
      sendSuccess(res, null, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      await conversationService.delete(req.userId!, Number(uuid));
      sendSuccess(res, null, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }
}

export default new ConversationController();
