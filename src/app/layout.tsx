import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { QueryProvider } from '@/providers/QueryProvider'
import { AntdAppProvider } from '@/providers/AntdAppProvider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Gemini Web - AI Chat Platform',
  description: '现代化 AI 聊天应用，支持多种 AI 模型',
  keywords: ['AI', 'Chat', 'Gemini', 'GPT', 'Claude'],
  authors: [{ name: 'Gemini Web Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
              },
            }}
          >
            <AntdAppProvider>
              <QueryProvider>{children}</QueryProvider>
            </AntdAppProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
