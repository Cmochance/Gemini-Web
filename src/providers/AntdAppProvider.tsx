'use client'

import { App } from 'antd'
import { useEffect } from 'react'
import { setMessageApi } from '@/service/http'

function MessageInitializer({ children }: { children: React.ReactNode }) {
  const { message } = App.useApp()

  useEffect(() => {
    // 设置全局 message API
    setMessageApi(message)
  }, [message])

  return <>{children}</>
}

export function AntdAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <App>
      <MessageInitializer>{children}</MessageInitializer>
    </App>
  )
}
