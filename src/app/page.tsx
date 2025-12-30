export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          欢迎使用 Gemini Web
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          现代化 AI 聊天平台，开始你的智能对话之旅
        </p>
        <div className="space-x-4">
          <a
            href="/chat"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始聊天
          </a>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            登录
          </a>
        </div>
      </div>
    </div>
  )
}
