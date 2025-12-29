import prisma from './prisma.service';

export interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

class ConfigService {
  private cache: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) || null;
    }

    const config = await prisma.systemConfig.findUnique({ where: { key } });
    if (config) {
      this.cache.set(key, config.value);
      return config.value;
    }
    return null;
  }

  async set(key: string, value: string, encrypted = false): Promise<void> {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value, encrypted },
      create: { key, value, encrypted },
    });
    this.cache.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await prisma.systemConfig.delete({ where: { key } }).catch(() => {});
    this.cache.delete(key);
  }

  clearCache(): void {
    this.cache.clear();
  }

  // ========== OpenAI Config ==========
  async getOpenAIConfig(): Promise<OpenAIConfig> {
    const apiKey = (await this.get('openai_api_key')) || process.env.OPENAI_API_KEY || '';
    const baseUrl = (await this.get('openai_base_url')) || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    return { apiKey, baseUrl };
  }

  async setOpenAIConfig(apiKey: string, baseUrl: string): Promise<void> {
    await this.set('openai_api_key', apiKey, true);
    await this.set('openai_base_url', baseUrl);
  }

  // ========== SMTP Config ==========
  async getSmtpConfig(): Promise<SmtpConfig> {
    const host = (await this.get('smtp_host')) || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt((await this.get('smtp_port')) || process.env.SMTP_PORT || '587');
    const secure = ((await this.get('smtp_secure')) || process.env.SMTP_SECURE) === 'true';
    const user = (await this.get('smtp_user')) || process.env.SMTP_USER || '';
    const pass = (await this.get('smtp_pass')) || process.env.SMTP_PASS || '';
    const from = (await this.get('smtp_from')) || process.env.SMTP_FROM || process.env.SMTP_USER || '';
    return { host, port, secure, user, pass, from };
  }

  async setSmtpConfig(config: Partial<SmtpConfig>): Promise<void> {
    if (config.host) await this.set('smtp_host', config.host);
    if (config.port) await this.set('smtp_port', config.port.toString());
    if (config.secure !== undefined) await this.set('smtp_secure', config.secure.toString());
    if (config.user) await this.set('smtp_user', config.user);
    if (config.pass) await this.set('smtp_pass', config.pass, true);
    if (config.from) await this.set('smtp_from', config.from);
  }

  // ========== Get masked config for display ==========
  getMaskedApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) return '****';
    return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
  }
}

export default new ConfigService();
