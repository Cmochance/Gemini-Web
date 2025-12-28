# Node.js + Express 后端快速开始模板

## 📁 项目结构

```
backend/
├── src/
│   ├── controllers/        # 控制器
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── chat.controller.ts
│   │   └── payment.controller.ts
│   ├── services/          # 业务逻辑
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── openai.service.ts
│   │   └── email.service.ts
│   ├── models/            # 数据模型
│   │   ├── user.model.ts
│   │   └── order.model.ts
│   ├── middleware/        # 中间件
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/           # 路由
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── chat.routes.ts
│   │   └── payment.routes.ts
│   ├── utils/            # 工具函数
│   │   ├── jwt.util.ts
│   │   ├── response.util.ts
│   │   └── validator.util.ts
│   └── app.ts            # 应用入口
├── .env                  # 环境变量
├── package.json
└── tsconfig.json
```

## 📦 package.json 示例

```json
{
  "name": "gemini-web-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "redis": "^4.6.0",
    "nodemailer": "^6.9.0",
    "openai": "^4.0.0",
    "express-rate-limit": "^6.8.0",
    "zod": "^3.21.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/bcrypt": "^5.0.0",
    "@types/nodemailer": "^6.4.9",
    "typescript": "^5.0.0",
    "ts-node-dev": "^2.0.0"
  }
}
```

## 🔑 核心代码示例

### 1. app.ts（应用入口）

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/v1/user', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/openai/v1', chatRoutes);
app.use('/api/v1', paymentRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. 响应格式工具（utils/response.util.ts）

```typescript
import { Response } from 'express';

export interface ApiResponse {
  code: number;
  data?: any;
  msg: string;
}

export const sendSuccess = (res: Response, data: any, msg = 'success') => {
  res.json({
    code: 0,
    data,
    msg
  });
};

export const sendError = (res: Response, msg: string, code = 1) => {
  res.json({
    code,
    data: null,
    msg
  });
};
```

### 3. 认证中间件（middleware/auth.middleware.ts）

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.util';

export interface AuthRequest extends Request {
  userId?: number;
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return sendError(res, '未提供认证令牌', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return sendError(res, '无效的认证令牌', 401);
  }
};
```

### 4. 登录接口（controllers/auth.controller.ts）

```typescript
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, '邮箱和密码不能为空', 400);
      }

      const token = await this.authService.login(email, password);
      
      // 设置 Cookie
      res.cookie('authorization', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
        path: '/'
      });

      return sendSuccess(res, token, '登录成功');
    } catch (error: any) {
      return sendError(res, error.message || '登录失败', 500);
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, code, inviteCode } = req.body;

      if (!email || !password || !code) {
        return sendError(res, '邮箱、密码和验证码不能为空', 400);
      }

      const token = await this.authService.register(
        email,
        password,
        code,
        inviteCode
      );

      // 设置 Cookie
      res.cookie('authorization', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      return sendSuccess(res, token, '注册成功');
    } catch (error: any) {
      return sendError(res, error.message || '注册失败', 500);
    }
  }

  async sendCode(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return sendError(res, '邮箱不能为空', 400);
      }

      await this.authService.sendVerificationCode(email);
      return sendSuccess(res, null, '验证码已发送');
    } catch (error: any) {
      return sendError(res, error.message || '发送失败', 500);
    }
  }
}
```

### 5. 聊天接口（controllers/chat.controller.ts）

```typescript
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { OpenAIService } from '../services/openai.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class ChatController {
  private openaiService = new OpenAIService();

  async chatCompletions(req: AuthRequest, res: Response) {
    try {
      const { messages, model, stream, max_tokens, temperature } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return sendError(res, '消息格式错误', 400);
      }

      // 检查用户积分
      // TODO: 实现积分检查逻辑

      if (stream) {
        // 流式响应
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        await this.openaiService.streamChat(
          messages,
          model || 'gpt-3.5-turbo',
          {
            max_tokens,
            temperature
          },
          (chunk: string) => {
            res.write(chunk);
          }
        );

        res.end();
      } else {
        // 普通响应
        const result = await this.openaiService.chat(
          messages,
          model || 'gpt-3.5-turbo',
          {
            max_tokens,
            temperature
          }
        );

        return sendSuccess(res, result, 'success');
      }
    } catch (error: any) {
      return sendError(res, error.message || '聊天失败', 500);
    }
  }

  async generateImage(req: AuthRequest, res: Response) {
    try {
      const { prompt, model, size, n } = req.body;

      if (!prompt) {
        return sendError(res, '提示词不能为空', 400);
      }

      const result = await this.openaiService.generateImage({
        prompt,
        model,
        size: size || '512x512',
        n: n || 1
      });

      return sendSuccess(res, result, 'success');
    } catch (error: any) {
      return sendError(res, error.message || '图片生成失败', 500);
    }
  }
}
```

### 6. 路由配置（routes/chat.routes.ts）

```typescript
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const chatController = new ChatController();

router.post('/chat/completions', authenticate, (req, res) => {
  chatController.chatCompletions(req as any, res);
});

router.post('/image', authenticate, (req, res) => {
  chatController.generateImage(req as any, res);
});

export default router;
```

### 7. OpenAI 服务（services/openai.service.ts）

```typescript
import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    });
  }

  async chat(messages: any[], model: string, options: any) {
    const response = await this.client.chat.completions.create({
      model,
      messages,
      ...options
    });

    return response;
  }

  async streamChat(
    messages: any[],
    model: string,
    options: any,
    onChunk: (chunk: string) => void
  ) {
    const stream = await this.client.chat.completions.create({
      model,
      messages,
      stream: true,
      ...options
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(JSON.stringify({
          role: 'assistant',
          id: chunk.id,
          text: content
        }) + '\n');
      }
    }
  }

  async generateImage(params: {
    prompt: string;
    model?: string;
    size?: string;
    n?: number;
  }) {
    const response = await this.client.images.generate({
      prompt: params.prompt,
      size: params.size as any,
      n: params.n || 1,
      response_format: 'url'
    });

    return response;
  }
}
```

## 🔐 环境变量配置（.env）

```env
# 服务器配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/gemini_web

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com
```

## 📋 待实现功能清单

- [ ] 数据库模型定义（Prisma Schema）
- [ ] 用户注册/登录完整实现
- [ ] 邮箱验证码发送（使用 Redis 存储）
- [ ] 积分系统实现
- [ ] 支付接口集成（支付宝/微信）
- [ ] 订单管理
- [ ] 接口限流
- [ ] 日志系统
- [ ] 错误处理完善
- [ ] 单元测试

## 🚀 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 初始化数据库
npx prisma migrate dev

# 4. 启动开发服务器
npm run dev
```

## 📚 下一步

1. 根据实际需求调整代码
2. 实现数据库模型
3. 完善业务逻辑
4. 添加测试
5. 配置生产环境

