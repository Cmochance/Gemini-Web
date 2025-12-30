import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '架构升级演示 - Gemini Web',
  description: '展示 Next.js 15 + Zustand + React Query 的强大功能',
}

export default function ExampleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
