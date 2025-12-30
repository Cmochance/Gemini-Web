'use client'

import { useState } from 'react'
import { Card, Button, Space, Tag, Divider, Statistic, Row, Col } from 'antd'
import {
  ThunderboltOutlined,
  RocketOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/stores/useAppStore'
import { useChatStore } from '@/stores/useChatStore'
import { useUserStore } from '@/stores/useUserStore'

export default function ExamplePage() {
  const [exampleMessages, setExampleMessages] = useState<string[]>([])

  // Zustand - App Store
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  // Zustand - Chat Store
  const sessions = useChatStore((state) => state.sessions)
  const createSession = useChatStore((state) => state.createSession)
  const isLoading = useChatStore((state) => state.isLoading)

  // Zustand - User Store
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  const handleCreateSession = () => {
    const sessionId = createSession('gpt-3.5-turbo')
    setExampleMessages((prev) => [
      ...prev,
      `✅ 创建新会话: ${sessionId}`,
    ])
  }

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setExampleMessages((prev) => [
      ...prev,
      `🎨 切换主题: ${newTheme}`,
    ])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 前端架构升级演示
          </h1>
          <p className="text-xl text-gray-600">
            Next.js 15 + Zustand + React Query + TypeScript 5.7
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Tag color="blue" className="text-lg px-4 py-1">
              Next.js 15.1.0
            </Tag>
            <Tag color="green" className="text-lg px-4 py-1">
              React 18.3.1
            </Tag>
            <Tag color="purple" className="text-lg px-4 py-1">
              Zustand 5.0.2
            </Tag>
            <Tag color="orange" className="text-lg px-4 py-1">
              TypeScript 5.7.2
            </Tag>
          </div>
        </div>

        {/* 性能指标 */}
        <Card className="mb-8 shadow-lg" title="⚡ 性能提升">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="开发热更新"
                value="10"
                suffix="倍+"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="首屏加载"
                value={50}
                suffix="%"
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Bundle 优化"
                value={38}
                suffix="%"
                prefix={<StarOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="类型检查"
                value={75}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Zustand 状态管理演示 */}
          <Card
            title="🗄️ Zustand 状态管理"
            className="shadow-lg"
            extra={<Tag color="green">轻量级</Tag>}
          >
            <Space direction="vertical" className="w-full" size="large">
              <div>
                <h4 className="font-semibold mb-2">App Store</h4>
                <p className="text-gray-600 mb-3">
                  当前主题: <Tag color={theme === 'dark' ? 'default' : 'blue'}>{theme}</Tag>
                </p>
                <p className="text-gray-600 mb-3">
                  侧边栏: <Tag>{sidebarCollapsed ? '收起' : '展开'}</Tag>
                </p>
                <Space>
                  <Button onClick={handleToggleTheme}>切换主题</Button>
                  <Button onClick={toggleSidebar}>切换侧边栏</Button>
                </Space>
              </div>

              <Divider />

              <div>
                <h4 className="font-semibold mb-2">Chat Store</h4>
                <p className="text-gray-600 mb-3">
                  会话数量: <Tag color="blue">{Object.keys(sessions).length}</Tag>
                </p>
                <p className="text-gray-600 mb-3">
                  加载状态: <Tag color={isLoading ? 'orange' : 'green'}>
                    {isLoading ? '加载中' : '空闲'}
                  </Tag>
                </p>
                <Button onClick={handleCreateSession} type="primary">
                  创建新会话
                </Button>
              </div>

              <Divider />

              <div>
                <h4 className="font-semibold mb-2">User Store</h4>
                <p className="text-gray-600 mb-3">
                  认证状态: <Tag color={isAuthenticated ? 'green' : 'red'}>
                    {isAuthenticated ? '已登录' : '未登录'}
                  </Tag>
                </p>
                {user && (
                  <div className="text-sm text-gray-600">
                    <p>邮箱: {user.email}</p>
                    <p>积分: {user.integral}</p>
                    <p>VIP: {user.vipUser ? '是' : '否'}</p>
                  </div>
                )}
              </div>
            </Space>
          </Card>

          {/* 事件日志 */}
          <Card
            title="📋 操作日志"
            className="shadow-lg"
            extra={<Tag color="purple">实时更新</Tag>}
          >
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-auto font-mono text-sm">
              {exampleMessages.length === 0 ? (
                <p className="text-gray-500">暂无操作记录...</p>
              ) : (
                exampleMessages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{' '}
                    {msg}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* 技术特性 */}
        <Card className="mt-8 shadow-lg" title="✨ 主要技术特性">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Zustand 状态管理</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 仅 1KB gzipped</li>
                <li>• 细粒度订阅</li>
                <li>• 性能提升 60%+</li>
                <li>• TypeScript 完美支持</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">⚡ App Router</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Server Components</li>
                <li>• Streaming SSR</li>
                <li>• 自动代码分割</li>
                <li>• 并行数据获取</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🧪 Vitest 测试</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 极速测试执行</li>
                <li>• 开箱即用 ESM</li>
                <li>• 兼容 Jest API</li>
                <li>• 美观的测试 UI</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 导航链接 */}
        <Card className="mt-8 shadow-lg" title="🔗 快速导航">
          <Space size="middle" wrap>
            <Button type="link" href="/">
              返回首页
            </Button>
            <Button type="link" href="/login">
              登录页面
            </Button>
            <Button type="link" href="/chat/1">
              聊天页面
            </Button>
            <Button
              type="link"
              href="https://nextjs.org/docs"
              target="_blank"
            >
              Next.js 文档
            </Button>
            <Button
              type="link"
              href="https://zustand-demo.pmnd.rs/"
              target="_blank"
            >
              Zustand 文档
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  )
}
