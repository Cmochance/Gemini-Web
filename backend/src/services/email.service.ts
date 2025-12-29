import nodemailer from 'nodemailer';
import { AppError } from '../middleware/error.middleware';
import configService, { SmtpConfig } from './config.service';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized: boolean = false;

  constructor() {
    this.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
    });
  }

  private createTransporter(config: SmtpConfig): void {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const config = await configService.getSmtpConfig();
      this.createTransporter(config);
      this.initialized = true;
    } catch {
      console.log('[Email] Using environment config');
    }
  }

  async reinitialize(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }

  async updateConfig(config: Partial<SmtpConfig>): Promise<void> {
    await configService.setSmtpConfig(config);
    const fullConfig = await configService.getSmtpConfig();
    this.createTransporter(fullConfig);
    this.initialized = true;
  }

  async getConfigDetails() {
    const config = await configService.getSmtpConfig();
    return {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      pass: configService.getMaskedApiKey(config.pass),
      from: config.from,
      hasCredentials: !!(config.user && config.pass),
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    await this.initialize();
    if (!this.transporter) {
      return { success: false, message: 'Transporter 未初始化' };
    }
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP 连接成功' };
    } catch (error: any) {
      return { success: false, message: error.message || 'SMTP 连接失败' };
    }
  }

  async sendVerifyCode(email: string, code: string): Promise<void> {
    await this.initialize();
    if (!this.transporter) {
      throw new AppError('邮件服务未配置', 500);
    }
    const config = await configService.getSmtpConfig();
    try {
      await this.transporter.sendMail({
        from: `"Gemini Web" <${config.from}>`,
        to: email,
        subject: '【Gemini Web】邮箱验证码',
        html: `
          <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;">
            <h1 style="color:#3050fb;text-align:center;">Gemini Web</h1>
            <div style="background:#f8f9fa;border-radius:8px;padding:30px;">
              <h2>邮箱验证码</h2>
              <p>您的验证码是：</p>
              <div style="background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:15px;text-align:center;">
                <span style="font-size:32px;font-weight:bold;color:#3050fb;letter-spacing:8px;">${code}</span>
              </div>
              <p style="color:#999;font-size:14px;margin-top:20px;">验证码有效期为5分钟</p>
            </div>
          </div>
        `,
      });
    } catch (error: any) {
      console.error('[Email] Send error:', error.message);
      throw new AppError('邮件发送失败', 500);
    }
  }
}

export default new EmailService();
