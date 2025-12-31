# Gemini Web - UI 文件索引

## 📁 关键 UI 文件位置

### 主要页面文件

#### 1. 首页
- **文件路径**: `src/app/page.tsx`
- **功能**: 欢迎页面，提供"开始聊天"和"登录"按钮
- **路由**: `/`

#### 2. 登录页
- **文件路径**: `src/app/(auth)/login/page.tsx`
- **功能**: 登录/注册表单，带粒子特效背景
- **路由**: `/login`
- **布局文件**: `src/app/(auth)/login/layout.tsx`

#### 3. 聊天页
- **主文件**: `src/app/chat/[id]/ChatPageClient.tsx`
- **服务端组件**: `src/app/chat/[id]/page.tsx`
- **加载状态**: `src/app/chat/[id]/loading.tsx`
- **功能**: 主要的聊天界面（侧边栏 + 聊天内容）
- **路由**: `/chat/[id]` (例如: `/chat/1`)

#### 4. 架构演示页
- **文件路径**: `src/app/example/page.tsx`
- **功能**: 展示 Zustand 状态管理、性能指标和技术特性
- **路由**: `/example`

#### 5. 特殊页面
- **404 页面**: `src/app/not-found.tsx`
- **错误页面**: `src/app/error.tsx`
- **全局加载**: `src/app/loading.tsx`
- **根布局**: `src/app/layout.tsx`

---

## 🧩 核心组件文件

### 布局组件

| 组件名称 | 文件路径 | 功能描述 |
|---------|---------|----------|
| **侧边栏** | `src/components/Sidebar/index.tsx` | 左侧会话列表，新建会话、历史记录 |
| **历史记录项** | `src/components/Sidebar/History.tsx` | 单条历史记录，支持编辑、删除 |
| **侧边栏底部** | `src/components/Sidebar/Footer.tsx` | 用户头像、设置按钮 |
| **顶部导航** | `src/components/Header/index.tsx` | 移动端顶部栏（菜单、标题、下载） |
| **输入框区域** | `src/components/Footer/index.tsx` | 底部输入区域（清空、下载、消息输入） |

### 聊天相关组件

| 组件名称 | 文件路径 | 功能描述 |
|---------|---------|----------|
| **聊天内容** | `src/components/ChatContent/index.tsx` | 消息列表展示区域 |
| **消息组件** | `src/components/Message/index.tsx` | 单条消息（用户/AI），支持复制、删除、重新生成 |
| **文本渲染** | `src/components/Text/index.tsx` | Markdown 文本渲染 |
| **图片展示** | `src/components/Image/index.tsx` | 图片消息展示 |

### 通用组件

| 组件名称 | 文件路径 | 功能描述 |
|---------|---------|----------|
| **按钮** | `src/components/Button/index.tsx` | 通用按钮组件（集成埋点） |
| **滚动条** | `src/components/Scrollbar/index.tsx` | 自定义滚动条 |
| **头像** | `src/components/Avatar/index.tsx` | AI 头像组件 |
| **用户头像** | `src/components/UserAvatar/index.tsx` | 用户头像组件 |
| **基本信息** | `src/components/BasicInfo/index.tsx` | 用户基本信息展示 |
| **设置面板** | `src/components/Setting/index.tsx` | 设置弹窗 |
| **计费信息** | `src/components/Billing/index.tsx` | 积分、VIP 信息 |
| **仅客户端** | `src/components/ClientOnly/index.tsx` | 客户端渲染包装器 |

---

## 🎨 样式文件

### 全局样式
- **主样式文件**: `src/styles/globals.css`
  - Tailwind CSS 引入
  - Ant Design 样式重置
  - 全局高度设置

### 主题样式
- **Markdown 样式**: `src/styles/github-markdown.scss` (1101 行)
  - GitHub 风格的 Markdown 渲染
- **代码高亮**: `src/styles/highlight.scss` (203 行)
  - 支持亮色/暗色主题
- **文本样式**: `src/styles/text.scss`

### 配置文件
- **Tailwind 配置**: `tailwind.config.js`
  - 暗色模式: `darkMode: "class"`
  - 扫描路径: `./src/**/*.{js,ts,jsx,tsx}`
  - 禁用 preflight（避免与 Ant Design 冲突）
- **PostCSS 配置**: `postcss.config.js`

---

## 📦 状态管理

### Zustand Stores（新架构 - 推荐使用）

| Store 名称 | 文件路径 | 管理内容 |
|-----------|---------|---------|
| **应用状态** | `src/stores/useAppStore.ts` | 主题、侧边栏、公告 |
| **聊天状态** | `src/stores/useChatStore.ts` | 会话列表、消息、加载状态 |
| **用户状态** | `src/stores/useUserStore.ts` | 认证、积分、VIP 状态 |

### Context API（遗留 - 正在迁移）

| Context 名称 | 文件路径 | 说明 |
|-------------|---------|------|
| **App Context** | `src/store/App.tsx` | ⚠️ 遗留代码 |
| **Chat Context** | `src/store/Chat.tsx` | ⚠️ 遗留代码 |
| **User Context** | `src/store/User.tsx` | ⚠️ 遗留代码 |

---

## 🔧 自定义 Hooks

| Hook 名称 | 文件路径 | 功能 |
|----------|---------|------|
| **聊天进度** | `src/hooks/useChatProgress.ts` | 管理聊天请求和流式响应 |
| **倒计时** | `src/hooks/useCountDown.ts` | 验证码倒计时 |
| **移动端检测** | `src/hooks/useIsMobile.ts` | 检测是否为移动设备 |
| **滚动控制** | `src/hooks/useScroll.ts` | 自动滚动到底部 |
| **主题管理** | `src/hooks/useTheme.ts` | 亮色/暗色主题切换 |

---

## 🛣️ 路由结构

### App Router 目录结构（主要）

```
src/app/
├── layout.tsx                    # 根布局（Ant Design + React Query）
├── page.tsx                      # 首页
├── loading.tsx                   # 全局加载
├── error.tsx                     # 错误边界
├── not-found.tsx                 # 404 页面
│
├── (auth)/                       # 路由分组（不影响 URL）
│   └── login/
│       ├── layout.tsx            # 登录页布局
│       └── page.tsx              # 登录/注册页面
│
├── chat/
│   └── [id]/                     # 动态路由
│       ├── page.tsx              # 服务端组件（数据预取）
│       ├── ChatPageClient.tsx    # 客户端组件（主要 UI）
│       └── loading.tsx           # 加载状态
│
└── example/
    ├── layout.tsx                # 演示页布局
    └── page.tsx                  # 架构演示
```

### Pages Router（API 路由）

```
src/pages/
├── _app.tsx                      # App 配置
├── _document.tsx                 # HTML 文档
├── _error.tsx                    # 错误页面
├── 404.tsx                       # 404 页面
│
└── api/                          # API 路由
    ├── [...all].ts               # API 代理（转发到后端）
    ├── chat-progress.ts          # 聊天流式响应
    ├── logout.ts                 # 登出
    └── notice.ts                 # 系统公告
```

---

## 🌐 API 服务

### HTTP 客户端
- **主文件**: `src/service/http.ts`
- **功能**: 封装所有后端 API 调用
  - 登录/注册
  - 用户信息
  - 验证码
  - 充值/订单

### 服务端工具
- **响应处理**: `src/service/server.ts`
- **日志记录**: `src/service/logger.ts`

---

## 📱 静态资源

### 图标和图片
- **Logo**: `public/logo.svg`
- **带背景 Logo**: `public/logo_with_bg.svg`
- **网站图标**: `public/favicon.ico`
- **作者头像**: `public/author.jpg`

### 配置文件
- **粒子特效**: `public/particles.json`

---

## 🔍 技术栈总结

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 15.1.0 | React 框架（App Router + SSR） |
| **React** | 18.3.1 | UI 库 |
| **TypeScript** | 5.7.2 | 类型安全 |
| **Ant Design** | 5.22.6 | UI 组件库 |
| **Tailwind CSS** | 3.4.17 | 实用类样式 |
| **Zustand** | 5.0.2 | 状态管理（新） |
| **React Query** | 5.62.8 | 服务端状态管理 |
| **Vitest** | 3.0.5 | 测试框架 |
| **Prettier** | 3.4.2 | 代码格式化 |

---

## 🎯 快速修改指南

### 修改首页样式
```bash
编辑: src/app/page.tsx
样式: Tailwind CSS 类名
```

### 修改登录页
```bash
编辑: src/app/(auth)/login/page.tsx
特效: 粒子背景配置在 public/particles.json
```

### 修改聊天界面
```bash
整体布局: src/app/chat/[id]/ChatPageClient.tsx
侧边栏:   src/components/Sidebar/index.tsx
聊天区:   src/components/ChatContent/index.tsx
输入框:   src/components/Footer/index.tsx
```

### 修改全局样式
```bash
编辑: src/styles/globals.css
配置: tailwind.config.js
```

---

## 📝 注意事项

1. **架构过渡期**: 项目正在从旧架构迁移到新架构
   - ✅ 优先使用 `src/app/`（App Router）
   - ✅ 优先使用 `src/stores/`（Zustand）
   - ⚠️ 避免修改 `src/pages/`（除 API 外）
   - ⚠️ 避免使用 `src/store/`（Context API）

2. **样式系统**: 同时使用三种样式方案
   - **Tailwind CSS**: 推荐用于快速布局
   - **SCSS**: 用于复杂样式（Markdown、代码高亮）
   - **Ant Design**: 用于表单、弹窗等交互组件

3. **响应式设计**: 所有页面都需考虑移动端适配
   - 使用 `useIsMobile` hook 检测设备
   - 使用 Tailwind 响应式类名（`sm:`, `md:`, `lg:`）

---

最后更新: 2025-12-31
