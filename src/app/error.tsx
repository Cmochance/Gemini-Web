'use client'

import { useEffect } from 'react'
import { Button } from 'antd'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">出错了</h2>
        <p className="text-gray-600 mb-6">
          {error.message || '应用程序遇到了一个错误'}
        </p>
        <Button type="primary" size="large" onClick={reset}>
          重试
        </Button>
      </div>
    </div>
  )
}
