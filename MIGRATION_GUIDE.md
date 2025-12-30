# 🚀 迁移指南 - Gemini-Web 新架构使用手册

## 目录

1. [快速开始](#快速开始)
2. [新架构概览](#新架构概览)
3. [状态管理迁移](#状态管理迁移)
4. [路由迁移](#路由迁移)
5. [组件开发](#组件开发)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

---

## 快速开始

### 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
http://localhost:30000
```

### 查看示例

访问架构演示页面了解新特性:
```
http://localhost:30000/example
```

---

## 新架构概览

### 技术栈对比

| 技术类别 | 旧方案 | 新方案 | 优势 |
|---------|--------|--------|------|
| **路由** | Pages Router | App Router | SSR、流式渲染、并行数据获取 |
| **状态管理** | Context API | Zustand | 1KB体积、细粒度订阅、无Provider嵌套 |
| **服务端状态** | 手动管理 | TanStack Query | 自动缓存、重新验证、后台更新 |
| **TypeScript** | 4.9.5 | 5.7.2 | 更好的类型推断、性能提升 |
| **测试** | 无 | Vitest | 极速测试、ESM原生支持 |

### 文件结构

```
src/
├── app/                    # 新架构 (App Router)
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── (auth)/login/       # 登录路由组
│   └── chat/[id]/          # 动态路由
│
├── pages/                  # 旧架构 (保留兼容)
│   ├── index.tsx
│   └── chat/[id].tsx
│
├── stores/                 # 新状态管理 (Zustand)
│   ├── useAppStore.ts
│   ├── useChatStore.ts
│   └── useUserStore.ts
│
├── store/                  # 旧状态管理 (待删除)
│   ├── App.tsx
│   ├── Chat.tsx
│   └── User.tsx
│
└── queries/                # React Query hooks
    ├── useUser.ts
    └── useModels.ts
```

---

## 状态管理迁移

### 从 Context API 到 Zustand

#### 旧方案 (Context API)

```typescript
// ❌ 不推荐 - 旧的 Context API
import { useContext } from 'react'
import { AppStore } from '@/store/App'

function MyComponent() {
  const { theme, setData } = useContext(AppStore)
  // 问题: 任何 AppStore 变化都会导致整个组件树重新渲染
}
```

#### 新方案 (Zustand)

```typescript
// ✅ 推荐 - 新的 Zustand
import { useAppStore } from '@/stores/useAppStore'

function MyComponent() {
  // 细粒度订阅 - 只有 theme 变化才会重新渲染此组件
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)

  return (
    <button onClick={() => setTheme('dark')}>
      当前主题: {theme}
    </button>
  )
}
```

### 可用的 Stores

#### 1. App Store (应用全局状态)

```typescript
import { useAppStore } from '@/stores/useAppStore'

// 读取状态
const theme = useAppStore((state) => state.theme)
const token = useAppStore((state) => state.token)
const hasContext = useAppStore((state) => state.hasContext)
const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
const notice = useAppStore((state) => state.notice)

// 更新状态
const setTheme = useAppStore((state) => state.setTheme)
const setToken = useAppStore((state) => state.setToken)
const setHasContext = useAppStore((state) => state.setHasContext)
const toggleSidebar = useAppStore((state) => state.toggleSidebar)
const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed)
const setNotice = useAppStore((state) => state.setNotice)
const reset = useAppStore((state) => state.reset)

// 示例
function Header() {
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      切换主题
    </button>
  )
}
```

#### 2. Chat Store (聊天状态)

```typescript
import { useChatStore } from '@/stores/useChatStore'

// 读取状态
const sessions = useChatStore((state) => state.sessions)
const activeSessionId = useChatStore((state) => state.activeSessionId)

// 更新状态
const addSession = useChatStore((state) => state.addSession)
const removeSession = useChatStore((state) => state.removeSession)
const setActiveSession = useChatStore((state) => state.setActiveSession)
const addMessage = useChatStore((state) => state.addMessage)
const reset = useChatStore((state) => state.reset)

// 示例
function ChatList() {
  const sessions = useChatStore((state) => state.sessions)
  const setActiveSession = useChatStore((state) => state.setActiveSession)

  return (
    <ul>
      {sessions.map(session => (
        <li
          key={session.id}
          onClick={() => setActiveSession(session.id)}
        >
          {session.title}
        </li>
      ))}
    </ul>
  )
}
```

#### 3. User Store (用户状态)

```typescript
import { useUserStore } from '@/stores/useUserStore'

// 读取状态
const user = useUserStore((state) => state.user)
const isLoggedIn = useUserStore((state) => state.isLoggedIn)

// 更新状态
const setUser = useUserStore((state) => state.setUser)
const clearUser = useUserStore((state) => state.clearUser)

// 示例
function UserProfile() {
  const user = useUserStore((state) => state.user)
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  if (!isLoggedIn) {
    return <a href="/login">登录</a>
  }

  return <div>欢迎, {user?.email}</div>
}
```

### 服务端状态管理 (React Query)

```typescript
import { useUser } from '@/queries/useUser'
import { useModels } from '@/queries/useModels'

function UserProfile() {
  // 自动处理加载、错误、缓存、重新验证
  const { data: user, isLoading, error, refetch } = useUser()

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>

  return (
    <div>
      <p>{user?.email}</p>
      <button onClick={() => refetch()}>刷新</button>
    </div>
  )
}
```

---

## 路由迁移

### 从 Pages Router 到 App Router

#### 旧方案 (Pages Router)

```typescript
// pages/chat/[id].tsx
import { useRouter } from 'next/router'

export default function ChatPage() {
  const router = useRouter()
  const { id } = router.query

  return <div>Chat {id}</div>
}
```

#### 新方案 (App Router)

```typescript
// app/chat/[id]/page.tsx
export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 可以在这里进行服务端数据获取
  const data = await fetchData(id)

  return <div>Chat {id}</div>
}
```

### Server Components vs Client Components

#### Server Component (默认)

```typescript
// app/chat/[id]/page.tsx
import { cookies } from 'next/headers'

// ✅ Server Component - 在服务器运行
export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  // 并行数据获取
  const [user, messages] = await Promise.all([
    fetchUser(token),
    fetchMessages(id)
  ])

  // 传递给客户端组件
  return <ChatPageClient user={user} messages={messages} />
}
```

#### Client Component

```typescript
// app/chat/[id]/ChatPageClient.tsx
'use client'  // 必须添加此指令

import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'

export default function ChatPageClient({ user, messages }) {
  const [input, setInput] = useState('')
  const theme = useAppStore((state) => state.theme)

  // 可以使用 hooks、状态、事件处理
  const handleSubmit = () => {
    // 发送消息
  }

  return <div>...</div>
}
```

### 路由组

```
app/
├── (auth)/              # 路由组 - URL 中不显示
│   ├── login/
│   │   └── page.tsx     # /login
│   └── register/
│       └── page.tsx     # /register
│
└── (main)/
    ├── chat/[id]/
    │   └── page.tsx     # /chat/123
    └── settings/
        └── page.tsx     # /settings
```

---

## 组件开发

### 创建新组件

#### 1. 纯 UI 组件 (无状态)

```typescript
// src/components/MyButton.tsx
interface Props {
  label: string
  onClick: () => void
}

export default function MyButton({ label, onClick }: Props) {
  return <button onClick={onClick}>{label}</button>
}
```

#### 2. 有状态组件 (使用 Zustand)

```typescript
// src/components/ThemeToggle.tsx
'use client'

import { useAppStore } from '@/stores/useAppStore'

export default function ThemeToggle() {
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      当前: {theme}
    </button>
  )
}
```

#### 3. 数据获取组件 (使用 React Query)

```typescript
// src/components/UserList.tsx
'use client'

import { useQuery } from '@tanstack/react-query'

export default function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      return res.json()
    }
  })

  if (isLoading) return <div>加载中...</div>

  return (
    <ul>
      {data.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}
```

### 创建新页面

#### App Router 页面

```typescript
// app/my-page/page.tsx
export default function MyPage() {
  return <div>我的新页面</div>
}
```

#### 带布局的页面

```typescript
// app/my-page/layout.tsx
export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="my-layout">
      <h1>我的页面布局</h1>
      {children}
    </div>
  )
}

// app/my-page/page.tsx
export default function MyPage() {
  return <div>页面内容</div>
}
```

---

## 最佳实践

### 1. 类型安全

```typescript
// ✅ 好的做法
const user = useUserStore((state) => state.user)
const name = user?.name ?? '未知用户'

// ❌ 不好的做法
const name = user.name  // 可能为 undefined
```

### 2. 性能优化

```typescript
// ✅ 好的做法 - 细粒度订阅
const theme = useAppStore((state) => state.theme)

// ❌ 不好的做法 - 订阅整个 store
const store = useAppStore()
const theme = store.theme  // store 任何变化都会重新渲染
```

### 3. Server vs Client Components

```typescript
// ✅ 好的做法 - 服务端获取数据
export default async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}

// ❌ 不好的做法 - 客户端获取(首屏慢)
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  return <div>{data}</div>
}
```

### 4. 错误处理

```typescript
// app/my-page/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>出错了!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  )
}
```

### 5. 加载状态

```typescript
// app/my-page/loading.tsx
export default function Loading() {
  return <div>加载中...</div>
}
```

---

## 常见问题

### Q1: 何时使用 Server Component vs Client Component?

**Server Component:**
- 数据获取
- 访问后端资源 (数据库、文件系统)
- 敏感信息处理 (API keys, tokens)
- 减少客户端 JavaScript

**Client Component:**
- 交互性 (onClick, onChange)
- 使用 React hooks (useState, useEffect)
- 使用浏览器 API (localStorage, window)
- 使用状态管理 (Zustand)

### Q2: 如何在 Server Component 中使用 Zustand?

**不能直接使用!** Zustand 需要在 Client Component 中使用:

```typescript
// ✅ 正确做法
// app/page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData()
  return <PageClient initialData={data} />
}

// app/PageClient.tsx (Client Component)
'use client'
import { useAppStore } from '@/stores/useAppStore'

export default function PageClient({ initialData }) {
  const theme = useAppStore((state) => state.theme)
  return <div className={theme}>{initialData}</div>
}
```

### Q3: 旧代码还能用吗?

**可以!** 为了保持兼容性:
- Pages Router 继续工作
- 旧的 Context API 仍然可用
- 优先级: App Router > Pages Router

但**推荐**:
- 新功能使用 App Router + Zustand
- 逐步迁移旧代码

### Q4: 如何调试?

```typescript
// Zustand DevTools
import { devtools } from 'zustand/middleware'

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'app-storage' }
    ),
    { name: 'AppStore' }  // 在 Redux DevTools 中显示
  )
)
```

### Q5: 如何测试?

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('渲染正确', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

运行测试:
```bash
npm run test        # 运行所有测试
npm run test:ui     # 测试 UI
npm run test:watch  # 监听模式
```

---

## 参考资源

### 官方文档

1. **Next.js 15**
   - https://nextjs.org/docs
   - App Router: https://nextjs.org/docs/app

2. **Zustand**
   - https://zustand-demo.pmnd.rs/
   - 最佳实践: https://docs.pmnd.rs/zustand/guides/best-practices

3. **TanStack Query**
   - https://tanstack.com/query/latest
   - 快速开始: https://tanstack.com/query/latest/docs/framework/react/quick-start

4. **TypeScript 5.7**
   - https://www.typescriptlang.org/docs/

5. **Vitest**
   - https://vitest.dev/

### 项目文档

- [UPGRADE_COMPLETE.md](./UPGRADE_COMPLETE.md) - 升级完成报告
- [FINAL_OPTIMIZATION.md](./FINAL_OPTIMIZATION.md) - 最终优化报告
- [OPTIMIZATION_REPORT.md](./OPTIMIZATION_REPORT.md) - 优化分析

---

## 获取帮助

如果遇到问题:

1. 查看 `/example` 页面的示例代码
2. 阅读本迁移指南
3. 查看官方文档
4. 检查已有代码的实现方式

---

**文档版本:** 1.0
**更新时间:** 2025-12-31
**维护者:** 开发团队

🎉 祝你开发愉快!
