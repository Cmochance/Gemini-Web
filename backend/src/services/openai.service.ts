import OpenAI from 'openai';
import { Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { ErrorCodes } from '../utils/response.util';
import { ChatMessage, ImageGenerationDto, ImageOperateDto, ModelInfo } from '../types';
import { generateUUID } from '../utils/helpers';

class OpenAIService {
  private client: OpenAI;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
      baseURL: this.baseURL,
    });
  }

  getConfig() {
    return { baseURL: this.baseURL, hasApiKey: !!process.env.OPENAI_API_KEY };
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.models.list();
      const models: ModelInfo[] = [];
      for await (const model of response) {
        models.push({
          id: model.id,
          object: model.object,
          created: model.created,
          owned_by: model.owned_by,
          type: this.getModelType(model.id),
          supportsStream: !model.id.includes('dall-e'),
        });
      }
      return models.sort((a, b) => a.id.localeCompare(b.id));
    } catch {
      return this.getDefaultModels();
    }
  }

  private getModelType(modelId: string): 'chat' | 'image' | 'embedding' | 'other' {
    const id = modelId.toLowerCase();
    if (id.includes('dall-e') || id.includes('image')) return 'image';
    if (id.includes('embedding')) return 'embedding';
    if (id.includes('gpt') || id.includes('claude') || id.includes('chat')) return 'chat';
    return 'other';
  }

  private getDefaultModels(): ModelInfo[] {
    return [
      { id: 'gpt-3.5-turbo', object: 'model', created: 0, owned_by: 'openai', type: 'chat', supportsStream: true },
      { id: 'gpt-4', object: 'model', created: 0, owned_by: 'openai', type: 'chat', supportsStream: true },
      { id: 'gpt-4o', object: 'model', created: 0, owned_by: 'openai', type: 'chat', supportsStream: true },
      { id: 'dall-e-3', object: 'model', created: 0, owned_by: 'openai', type: 'image', supportsStream: false },
    ];
  }

  async chat(messages: ChatMessage[], model = 'gpt-3.5-turbo', options: any = {}) {
    try {
      return await this.client.chat.completions.create({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: options.max_tokens || 2000,
        temperature: options.temperature ?? 0.8,
      });
    } catch (error: any) {
      throw new AppError(error.message || 'AI 服务异常', ErrorCodes.AI_SERVICE_ERROR);
    }
  }

  async streamChat(messages: ChatMessage[], model = 'gpt-3.5-turbo', options: any = {}, res: Response) {
    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: options.max_tokens || 2000,
        temperature: options.temperature ?? 0.8,
        stream: true,
      });

      const responseId = generateUUID();
      let fullContent = '';
      let first = true;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          const result = JSON.stringify({ role: 'assistant', id: responseId, text: fullContent });
          res.write(first ? result : `\n${result}`);
          first = false;
        }
      }
    } catch (error: any) {
      const errorResponse = JSON.stringify({ role: 'assistant', id: generateUUID(), text: '', error: true, errorMessage: error.message });
      res.write(errorResponse);
    }
  }

  async generateImage(dto: ImageGenerationDto) {
    try {
      const response = await this.client.images.generate({
        prompt: dto.prompt,
        model: dto.model || 'dall-e-2',
        n: dto.n || 1,
        size: dto.size || '512x512',
      });
      return { code: 0, data: response.data, msg: 'success' };
    } catch (error: any) {
      throw new AppError(error.message || '图片生成失败', ErrorCodes.AI_SERVICE_ERROR);
    }
  }

  async operateImage(dto: ImageOperateDto) {
    if (!process.env.MIDJOURNEY_BASE_URL) {
      throw new AppError('Midjourney 服务未配置', ErrorCodes.AI_SERVICE_ERROR);
    }
    // Midjourney API implementation
    return { code: 0, data: null, msg: 'success' };
  }
}

export default new OpenAIService();

