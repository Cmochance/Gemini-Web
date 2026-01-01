'use client'

import { useEffect, useState } from 'react'
import { Alert, Checkbox, Layout, Modal } from 'antd'
import classNames from 'classnames'
import ChatStoreProvider from '@/store/Chat'
import User from '@/store/User'
import Sidebar from '@/components/Sidebar'
import ChatContent from '@/components/ChatContent'
import Button from '@/components/Button'
import useIsMobile from '@/hooks/useIsMobile'
import { useUserStore } from '@/stores/useUserStore'
import { useAppStore } from '@/stores/useAppStore'

interface UserInfo {
  nickName?: string
  avatar?: string
  email?: string
  inviteCode?: string
  integral?: number
  vipUser?: boolean
}

interface ChatPageClientProps {
  chatId: string
  initialUserInfo: UserInfo | null
  notice: string
}

export default function ChatPageClient({
  chatId,
  initialUserInfo,
  notice,
}: ChatPageClientProps) {
  const isMobile = useIsMobile()
  const setUser = useUserStore((state) => state.setUser)
  const updateIntegral = useUserStore((state) => state.updateIntegral)
  const [showNotice, setShowNotice] = useState(false)

  // 使用 Zustand 替代 Context
  const noticeText = useAppStore((state) => state.notice)
  const noNotice = useAppStore((state) => state.hasContext) // 临时映射
  const setNotice = useAppStore((state) => state.setNotice)
  const setHasContext = useAppStore((state) => state.setHasContext)

  // 初始化用户信息
  useEffect(() => {
    if (initialUserInfo) {
      setUser({
        id: initialUserInfo.email || '',
        email: initialUserInfo.email || '',
        integral: initialUserInfo.integral || 0,
        vipUser: initialUserInfo.vipUser || false,
        inviteCode: initialUserInfo.inviteCode || '',
        createdAt: new Date().toISOString(),
      })
    }
  }, [initialUserInfo, setUser])

  // 处理公告显示
  useEffect(() => {
    if (notice) {
      setNotice(notice)
      if (!noNotice) {
        setShowNotice(true)
      }
    }
  }, [notice, noNotice, setNotice])

  return (
    <User>
      <ChatStoreProvider chatId={chatId}>
        <div className="h-screen dark:bg-[#24272e] transition-all">
          <div className="h-full overflow-hidden">
            <Layout className={classNames('z-40', 'h-full', 'transition')} hasSider>
              <Sidebar />
              <Layout.Content className="h-full bg-[#f8f9fa] dark:bg-[#24272e]">
                <ChatContent />
              </Layout.Content>
            </Layout>
          </div>
        </div>

        <Modal footer={null} closable={false} open={showNotice} width={600}>
          <Alert
            className="mb-4"
            description={<div dangerouslySetInnerHTML={{ __html: notice || '' }} />}
            type="success"
          />
          <div className="flex items-center justify-end">
            <Checkbox
              checked={!noNotice}
              onChange={(e) => setHasContext(!e.target.checked)}
            >
              不再弹出
            </Checkbox>
            <Button type="primary" className="ml-4" onClick={() => setShowNotice(false)}>
              我知道了
            </Button>
          </div>
        </Modal>
      </ChatStoreProvider>
    </User>
  )
}
