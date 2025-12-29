import Redis from 'ioredis';

class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
    });
    this.client.on('connect', () => console.log('[Redis] Connected'));
    this.client.on('error', (err) => console.error('[Redis] Error:', err.message));
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) await this.client.setex(key, ttl, value);
    else await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async setVerifyCode(email: string, code: string, type = 'register'): Promise<void> {
    await this.set(`verify_code:${type}:${email}`, code, 5 * 60);
  }

  async getVerifyCode(email: string, type = 'register'): Promise<string | null> {
    return await this.get(`verify_code:${type}:${email}`);
  }

  async delVerifyCode(email: string, type = 'register'): Promise<void> {
    await this.del(`verify_code:${type}:${email}`);
  }

  async checkSendLimit(email: string, type = 'register'): Promise<boolean> {
    const exists = await this.client.exists(`send_limit:${type}:${email}`);
    return exists === 0;
  }

  async setSendLimit(email: string, type = 'register', seconds = 60): Promise<void> {
    await this.set(`send_limit:${type}:${email}`, '1', seconds);
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}

export default new RedisService();

