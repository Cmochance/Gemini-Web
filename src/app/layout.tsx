import type { Metadata, Viewport } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { QueryProvider } from '@/providers/QueryProvider'
import { AntdAppProvider } from '@/providers/AntdAppProvider'
import App from '@/store/App'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Gemini Web - AI Chat Platform',
  description: '现代化 AI 聊天应用，支持多种 AI 模型',
  keywords: ['AI', 'Chat', 'Gemini', 'GPT', 'Claude'],
  authors: [{ name: 'Gemini Web Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className={inter.className}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
              },
            }}
          >
            <AntdAppProvider>
              <App>
                <QueryProvider>{children}</QueryProvider>
              </App>
            </AntdAppProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
