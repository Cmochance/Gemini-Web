import { Request, Response } from 'express';
import openaiService from '../services/openai.service';
import integralService from '../services/integral.service';
import { sendSuccess, sendError, ErrorCodes } from '../utils/response.util';
import { validate, chatSchema, imageSchema, imageOperateSchema } from '../utils/validator.util';
import { AuthRequest, ChatCompletionDto, ImageGenerationDto, ImageOperateDto } from '../types';

class ChatController {
  async getModels(req: Request, res: Response): Promise<void> {
    try {
      const models = await openaiService.getModels();
      const type = req.query.type as string;
      const filtered = type ? models.filter(m => m.type === type) : models;
      sendSuccess(res, { object: 'list', data: filtered }, 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(res, openaiService.getConfig(), 'success');
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async chatCompletions(req: AuthRequest, res: Response): Promise<void> {
    const validation = validate(chatSchema, req.body);
    if (!validation.success) { sendError(res, validation.error, 400); return; }

    try {
      const dto = validation.data as ChatCompletionDto;
      const hasSufficient = await integralService.checkSufficient(req.userId!, false);
      if (!hasSufficient) { sendError(res, '积分不足', ErrorCodes.INSUFFICIENT_INTEGRAL); return; }

      const model = dto.model || 'glm-4.7';
      const options = { max_tokens: dto.max_tokens || dto.maxTokens, temperature: dto.temperature };

      if (dto.stream) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        await openaiService.streamChat(dto.messages, model, options, res);
        try { await integralService.consume(req.userId!, false); } catch { }
        res.end();
      } else {
        const result = await openaiService.chat(dto.messages, model, options);
        await integralService.consume(req.userId!, false);
        sendSuccess(res, result, 'success');
      }
    } catch (error: any) {
      if (res.headersSent) { res.write(`\n${JSON.stringify({ error: true, message: error.message })}`); res.end(); }
      else { sendError(res, error.message, error.code || 500); }
    }
  }

  async generateImage(req: AuthRequest, res: Response): Promise<void> {
    const validation = validate(imageSchema, req.body);
    if (!validation.success) { sendError(res, validation.error, 400); return; }

    try {
      const hasSufficient = await integralService.checkSufficient(req.userId!, true);
      if (!hasSufficient) { sendError(res, '积分不足', ErrorCodes.INSUFFICIENT_INTEGRAL); return; }

      const result = await openaiService.generateImage(validation.data as ImageGenerationDto);
      await integralService.consume(req.userId!, true);
      res.json(result);
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }

  async operateImage(req: AuthRequest, res: Response): Promise<void> {
    const validation = validate(imageOperateSchema, req.body);
    if (!validation.success) { sendError(res, validation.error, 400); return; }

    try {
      const hasSufficient = await integralService.checkSufficient(req.userId!, true);
      if (!hasSufficient) { sendError(res, '积分不足', ErrorCodes.INSUFFICIENT_INTEGRAL); return; }

      const result = await openaiService.operateImage(validation.data as ImageOperateDto);
      await integralService.consume(req.userId!, true);
      res.json(result);
    } catch (error: any) {
      sendError(res, error.message, error.code || 500);
    }
  }
}

export default new ChatController();

