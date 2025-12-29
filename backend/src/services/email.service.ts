import nodemailer from 'nodemailer';
import { AppError } from '../middleware/error.middleware';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerifyCode(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Gemini Web" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
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

