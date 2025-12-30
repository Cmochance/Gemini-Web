import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          欢迎使用 Gemini Web
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          现代化 AI 聊天平台，开始你的智能对话之旅
        </p>
        <p className="text-sm text-gray-500 mb-8">
          🚀 已升级至 Next.js 15 + Zustand + React Query
        </p>
        <div className="space-x-4">
          <Link
            href="/chat/1"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始聊天
          </Link>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            登录
          </Link>
          <Link
            href="/example"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            ✨ 架构演示
          </Link>
        </div>
      </div>
    </div>
  )
}
