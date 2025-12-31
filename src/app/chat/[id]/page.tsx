import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ChatPageClient from './ChatPageClient'

export const metadata: Metadata = {
  title: '聊天 - Gemini Web',
  description: 'AI 智能对话',
}

// 服务端获取用户信息
async function getUserInfo(token: string | undefined) {
  if (!token) return null

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:31001'}/api/v1/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) return null
    const result = await response.json()
    // 后端返回格式: { code: 0, data: {...}, msg: '...' }
    if (result.code === 0 && result.data) {
      return result.data
    }
    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 服务端获取系统公告
async function getNotice() {
  // 直接返回环境变量中的公告，避免 SSR 时的 HTTP 请求问题
  return process.env.NOTICE || ''
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('authorization')?.value

  // 服务端并行获取数据
  const [userInfo, notice] = await Promise.all([
    getUserInfo(token),
    getNotice(),
  ])

  // 未登录重定向到登录页
  if (!token && !userInfo) {
    redirect('/login')
  }

  return (
    <ChatPageClient
      chatId={id}
      initialUserInfo={userInfo}
      notice={notice}
    />
  )
}
