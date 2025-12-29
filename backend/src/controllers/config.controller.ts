import { Request, Response, NextFunction } from 'express';
import { success } from '../utils/response.util';
import openaiService from '../services/openai.service';
import emailService from '../services/email.service';

export const getOpenAIConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await openaiService.getConfigDetails();
        res.json(success(config));
    } catch (error) {
        next(error);
    }
};

export const updateOpenAIConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { apiKey, baseUrl } = req.body;
        if (!apiKey && !baseUrl) {
            return res.status(400).json({ code: 400, msg: '请提供 apiKey 或 baseUrl' });
        }

        const currentConfig = await openaiService.getConfigDetails();
        const newApiKey = apiKey || '';
        const newBaseUrl = baseUrl || currentConfig.baseUrl;

        await openaiService.updateConfig(newApiKey, newBaseUrl);
        const updated = await openaiService.getConfigDetails();
        res.json(success(updated, 'OpenAI 配置已更新'));
    } catch (error) {
        next(error);
    }
};

export const getSmtpConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await emailService.getConfigDetails();
        res.json(success(config));
    } catch (error) {
        next(error);
    }
};

export const updateSmtpConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { host, port, secure, user, pass, from } = req.body;
        await emailService.updateConfig({ host, port, secure, user, pass, from });
        const updated = await emailService.getConfigDetails();
        res.json(success(updated, 'SMTP 配置已更新'));
    } catch (error) {
        next(error);
    }
};

export const testSmtpConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await emailService.testConnection();
        if (result.success) {
            res.json(success(result, result.message));
        } else {
            res.status(400).json({ code: 400, msg: result.message, data: result });
        }
    } catch (error) {
        next(error);
    }
};
