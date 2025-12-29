# Gemini Web

🚀 A modern AI chat application with support for multiple AI models, built with Next.js and Node.js.

English | [中文](./README-zh.md) | [Project Structure](./STRUCTURE.md)

## ✨ Features

- 🤖 **Multi-Model Support** - GPT-3.5, GPT-4, Claude, and more
- 🎨 **Image Generation** - DALL-E, Stable Diffusion, Midjourney
- 💬 **Streaming Response** - Real-time chat experience
- 👤 **User System** - Registration, login, profile management
- 💰 **Credit System** - Pay-per-use with recharge options
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔐 **Secure** - JWT authentication, rate limiting

## 📁 Project Structure

```
Gemini-Web/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── Avatar/          # User avatar
│   │   ├── BasicInfo/       # User information
│   │   ├── Billing/         # Payment & packages
│   │   ├── Button/          # Custom button
│   │   ├── ChatContent/     # Chat interface
│   │   ├── Header/          # Page header
│   │   ├── Message/         # Chat messages
│   │   ├── Scrollbar/       # Custom scrollbar
│   │   ├── Setting/         # Settings modal
│   │   ├── Sidebar/         # Navigation sidebar
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useChatProgress.ts
│   │   ├── useCountDown.ts
│   │   ├── useIsMobile.ts
│   │   ├── useScroll.ts
│   │   └── useTheme.ts
│   ├── pages/               # Next.js pages
│   │   ├── api/             # API routes (proxy)
│   │   ├── chat/            # Chat pages
│   │   ├── login/           # Authentication
│   │   └── index.tsx        # Home page
│   ├── service/             # Services
│   │   ├── chatgpt.ts       # AI chat service
│   │   ├── http.ts          # HTTP client
│   │   ├── localStorage.ts  # Local storage
│   │   └── server.ts        # Server utilities
│   ├── store/               # State management
│   │   ├── App.tsx          # App context
│   │   ├── Chat.tsx         # Chat context
│   │   └── User.tsx         # User context
│   ├── styles/              # Stylesheets
│   └── utils/               # Utilities
├── backend/                  # Backend source code
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   └── app.ts           # App entry point
│   ├── prisma/              # Database schema
│   └── Dockerfile           # Backend Docker
├── public/                   # Static assets
├── scripts/                  # Deployment scripts
├── docker-compose.yml        # Full stack Docker
├── docker-compose.dev.yml    # Development Docker
├── Dockerfile               # Frontend Docker
├── PORTS.md                 # Port mapping reference
└── env.example              # Environment template
```

## 🚀 Quick Start

### Option 1: One-Click Deployment (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/Gemini-Web.git
cd Gemini-Web

# 2. Run the setup wizard
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or quick deploy with default settings
./scripts/setup.sh --quick
```

### Option 2: Manual Docker Deployment

```bash
# 1. Configure environment variables
cp env.example .env
# Edit .env with your settings

# 2. Start all services
chmod +x scripts/deploy.sh
./scripts/deploy.sh start

# Other commands
./scripts/deploy.sh stop      # Stop services
./scripts/deploy.sh restart   # Restart services
./scripts/deploy.sh logs      # View logs
./scripts/deploy.sh status    # View status
```

### Option 2: Local Development

```bash
# 1. Start database services
docker-compose -f docker-compose.dev.yml up -d

# 2. Setup backend
cd backend
npm install
cp env.example .env
npm run db:generate
npm run db:push
npm run dev

# 3. Setup frontend (new terminal)
cd ..
npm install
npm run dev
```

## 🔌 Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 30000 | Web application |
| Backend API | 31001 | REST API |
| PostgreSQL | 35432 | Database |
| Redis | 36379 | Cache |

> See [PORTS.md](./PORTS.md) for detailed port information.

## 🔧 Environment Variables

Key configurations in `.env`:

```bash
# AI API
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# Database
DB_USER=gemini
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-secret-key
```

## 🤖 Supported AI Providers

- OpenAI (GPT-3.5, GPT-4, DALL-E)
- Azure OpenAI
- OneAPI
- API2D
- OpenRouter
- Moonshot
- DeepSeek
- Zhipu AI
- Qwen (Tongyi)

## 📚 API Documentation

### Authentication
- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/verify/send_code` - Send verification code

### User
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update profile

### Chat
- `GET /api/v1/openai/v1/models` - List available models
- `POST /api/v1/openai/v1/chat/completions` - Chat completion
- `POST /api/v1/openai/v1/image` - Image generation

### Payment
- `POST /api/v1/pay/pre_create` - Create order
- `GET /api/v1/pay/status` - Check order status

## 🛠 Tech Stack

**Frontend:**
- Next.js 13
- React 18
- TypeScript
- Tailwind CSS
- Ant Design

**Backend:**
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis

## 📄 License

MIT License

## 🙏 Acknowledgments

Based on [chatgpt-web-next](https://github.com/helianthuswhite/chatgpt-web-next)
