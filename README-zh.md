# Gemini Web

🚀 一个现代化的 AI 聊天应用，支持多种 AI 模型，基于 Next.js 和 Node.js 构建。

[English](./README.md) | 中文 | [项目结构](./STRUCTURE.md)

## ✨ 功能特性

- 🤖 **多模型支持** - GPT-3.5、GPT-4、Claude 等
- 🎨 **图像生成** - DALL-E、Stable Diffusion、Midjourney
- 💬 **流式响应** - 实时聊天体验
- 👤 **用户系统** - 注册、登录、个人资料管理
- 💰 **积分系统** - 按次付费，支持充值
- 📱 **响应式设计** - 支持桌面端和移动端
- 🔐 **安全可靠** - JWT 认证、接口限流

## 📁 项目结构

```
Gemini-Web/
├── src/                      # 前端源代码
│   ├── components/           # React 组件
│   │   ├── Avatar/          # 用户头像
│   │   ├── BasicInfo/       # 用户信息
│   │   ├── Billing/         # 支付与套餐
│   │   ├── Button/          # 自定义按钮
│   │   ├── ChatContent/     # 聊天界面
│   │   ├── Header/          # 页面头部
│   │   ├── Message/         # 聊天消息
│   │   ├── Scrollbar/       # 自定义滚动条
│   │   ├── Setting/         # 设置弹窗
│   │   ├── Sidebar/         # 导航侧边栏
│   │   └── ...
│   ├── hooks/               # 自定义 React Hooks
│   │   ├── useChatProgress.ts  # 聊天进度
│   │   ├── useCountDown.ts     # 倒计时
│   │   ├── useIsMobile.ts      # 移动端检测
│   │   ├── useScroll.ts        # 滚动处理
│   │   └── useTheme.ts         # 主题切换
│   ├── pages/               # Next.js 页面
│   │   ├── api/             # API 路由（代理）
│   │   ├── chat/            # 聊天页面
│   │   ├── login/           # 登录注册
│   │   └── index.tsx        # 首页
│   ├── service/             # 服务层
│   │   ├── chatgpt.ts       # AI 聊天服务
│   │   ├── http.ts          # HTTP 客户端
│   │   ├── localStorage.ts  # 本地存储
│   │   └── server.ts        # 服务端工具
│   ├── store/               # 状态管理
│   │   ├── App.tsx          # 应用上下文
│   │   ├── Chat.tsx         # 聊天上下文
│   │   └── User.tsx         # 用户上下文
│   ├── styles/              # 样式文件
│   └── utils/               # 工具函数
├── backend/                  # 后端源代码
│   ├── src/
│   │   ├── controllers/     # 控制器层
│   │   ├── services/        # 服务层（业务逻辑）
│   │   ├── middleware/      # 中间件
│   │   ├── routes/          # 路由配置
│   │   ├── types/           # TypeScript 类型
│   │   ├── utils/           # 工具函数
│   │   └── app.ts           # 应用入口
│   ├── prisma/              # 数据库模型
│   └── Dockerfile           # 后端 Docker 配置
├── public/                   # 静态资源
├── scripts/                  # 部署脚本
├── docker-compose.yml        # 完整 Docker 配置
├── docker-compose.dev.yml    # 开发环境 Docker
├── Dockerfile               # 前端 Docker 配置
├── PORTS.md                 # 端口映射文档
└── env.example              # 环境变量模板
```

## 🚀 快速开始

### 方式一：一键部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/your-repo/Gemini-Web.git
cd Gemini-Web

# 2. 运行一键配置工具
chmod +x scripts/setup.sh
./scripts/setup.sh

# 或使用快速部署（默认配置）
./scripts/setup.sh --quick

# Windows 用户
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

### 方式二：手动 Docker 部署

```bash
# 1. 配置环境变量
cp env.example .env
# 编辑 .env 文件，填入实际配置

# 2. 启动所有服务
chmod +x scripts/deploy.sh
./scripts/deploy.sh start

# 其他命令
./scripts/deploy.sh stop      # 停止服务
./scripts/deploy.sh restart   # 重启服务
./scripts/deploy.sh logs      # 查看日志
./scripts/deploy.sh status    # 查看状态
```

### 方式二：本地开发

```bash
# 1. 启动数据库服务
docker-compose -f docker-compose.dev.yml up -d

# 2. 启动后端
cd backend
npm install
cp env.example .env
npm run db:generate
npm run db:push
npm run dev

# 3. 启动前端（新终端）
cd ..
npm install
npm run dev
```

## 🔌 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 Frontend | 30000 | Web 应用 |
| 后端 Backend | 31001 | REST API |
| PostgreSQL | 35432 | 数据库 |
| Redis | 36379 | 缓存 |

> 详细端口信息请查看 [PORTS.md](./PORTS.md)

## 🔧 环境变量配置

`.env` 文件中的关键配置：

```bash
# AI API 配置
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# 数据库配置
DB_USER=gemini
DB_PASSWORD=your-password

# JWT 配置
JWT_SECRET=your-secret-key
```

## 🤖 支持的 AI 服务商

| 服务商 | Base URL |
|--------|----------|
| OpenAI 官方 | `https://api.openai.com/v1` |
| Azure OpenAI | `https://YOUR_RESOURCE.openai.azure.com/...` |
| OneAPI | `http://your-oneapi-server/v1` |
| API2D | `https://oa.api2d.net/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |
| 月之暗面 Moonshot | `https://api.moonshot.cn/v1` |
| DeepSeek | `https://api.deepseek.com/v1` |
| 智谱 AI | `https://open.bigmodel.cn/api/paas/v4` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` |

## 📚 API 接口文档

### 认证接口
- `POST /api/v1/user/login` - 用户登录
- `POST /api/v1/user/register` - 用户注册
- `POST /api/v1/user/verify/send_code` - 发送验证码

### 用户接口
- `GET /api/v1/user/profile` - 获取用户信息
- `PUT /api/v1/user/profile` - 更新用户信息

### 聊天接口
- `GET /api/v1/openai/v1/models` - 获取模型列表
- `POST /api/v1/openai/v1/chat/completions` - 聊天对话
- `POST /api/v1/openai/v1/image` - 图像生成

### 支付接口
- `POST /api/v1/pay/pre_create` - 创建订单
- `GET /api/v1/pay/status` - 查询订单状态

## 🛠 技术栈

**前端：**
- Next.js 13
- React 18
- TypeScript
- Tailwind CSS
- Ant Design

**后端：**
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis

## 🚀 部署指南

### 服务器要求

- CPU: 2核+
- 内存: 4GB+
- 硬盘: 20GB+
- 系统: Ubuntu 20.04+ / CentOS 8+

### 部署步骤

```bash
# 1. 上传代码到服务器
scp -r Gemini-Web/ user@server:/path/to/

# 2. SSH 连接服务器
ssh user@server

# 3. 进入项目目录
cd /path/to/Gemini-Web

# 4. 配置环境变量
cp env.example .env
vim .env

# 5. 启动服务
./scripts/deploy.sh start

# 6. 配置 Nginx 反向代理（可选）
# 7. 配置 SSL 证书（推荐）
```

### 防火墙配置

```bash
# 开放端口
sudo ufw allow 30000/tcp  # 前端
sudo ufw allow 31001/tcp  # 后端（如需直接访问）
```

## 📄 开源协议

MIT License

## 🙏 致谢

本项目基于 [chatgpt-web-next](https://github.com/helianthuswhite/chatgpt-web-next) 开发

