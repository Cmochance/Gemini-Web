import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登录 / 注册 - Gemini Web',
  description: '登录或注册 Gemini Web 账户',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
