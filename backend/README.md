# Gemini Web Backend

后端 API 服务，基于 Node.js + Express + TypeScript + Prisma。

## 🚀 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 配置环境变量
cp env.example .env

# 初始化数据库
npm run db:generate
npm run db:push

# 启动开发服务器
npm run dev
```

### 生产构建

```bash
npm run build
npm start
```

## 📁 目录结构

```
backend/
├── src/
│   ├── app.ts              # 应用入口
│   ├── controllers/        # 控制器层
│   ├── services/           # 服务层
│   ├── routes/             # 路由层
│   ├── middleware/         # 中间件
│   ├── types/              # 类型定义
│   └── utils/              # 工具函数
├── prisma/
│   └── schema.prisma       # 数据库模型
├── package.json
└── tsconfig.json
```

## 🔌 API 接口

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证 | `/api/v1/user/login` | 登录 |
| 认证 | `/api/v1/user/register` | 注册 |
| 认证 | `/api/v1/user/verify/send_code` | 发送验证码 |
| 用户 | `/api/v1/user/profile` | 用户信息 |
| 聊天 | `/api/v1/openai/v1/models` | 模型列表 |
| 聊天 | `/api/v1/openai/v1/chat/completions` | 对话 |
| 聊天 | `/api/v1/openai/v1/image` | 图片生成 |
| 积分 | `/api/v1/integral/recharge` | 充值 |
| 支付 | `/api/v1/pay/pre_create` | 创建订单 |
| 支付 | `/api/v1/pay/status` | 订单状态 |

## 🔧 环境变量

```bash
PORT=31001
DATABASE_URL=postgresql://user:pass@localhost:35432/db
REDIS_URL=redis://:pass@localhost:36379
JWT_SECRET=your-secret
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 📦 技术栈

- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- OpenAI SDK

