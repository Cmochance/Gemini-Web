import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  parentMessageId?: string
  conversationId?: string
  createdAt?: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  model: string
  createdAt: number
  updatedAt: number
}

interface ChatState {
  // 当前会话
  currentChatId: string | null
  sessions: Record<string, ChatSession>
  isLoading: boolean

  // Actions
  setCurrentChatId: (id: string | null) => void
  createSession: (model: string) => string
  deleteSession: (id: string) => void
  addMessage: (chatId: string, message: ChatMessage) => void
  updateMessage: (chatId: string, messageId: string, text: string) => void
  setLoading: (loading: boolean) => void
  clearSessions: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentChatId: null,
  sessions: {},
  isLoading: false,

  setCurrentChatId: (id) => set({ currentChatId: id }),

  createSession: (model) => {
    const id = `chat-${Date.now()}`
    const newSession: ChatSession = {
      id,
      title: '新对话',
      messages: [],
      model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    set((state) => ({
      sessions: { ...state.sessions, [id]: newSession },
      currentChatId: id,
    }))

    return id
  },

  deleteSession: (id) => {
    const { sessions, currentChatId } = get()
    const newSessions = { ...sessions }
    delete newSessions[id]

    set({
      sessions: newSessions,
      currentChatId: currentChatId === id ? null : currentChatId,
    })
  },

  addMessage: (chatId, message) => {
    set((state) => {
      const session = state.sessions[chatId]
      if (!session) return state

      const updatedSession = {
        ...session,
        messages: [...session.messages, message],
        updatedAt: Date.now(),
        title:
          session.messages.length === 0
            ? message.text.slice(0, 30)
            : session.title,
      }

      return {
        sessions: { ...state.sessions, [chatId]: updatedSession },
      }
    })
  },

  updateMessage: (chatId, messageId, text) => {
    set((state) => {
      const session = state.sessions[chatId]
      if (!session) return state

      const updatedMessages = session.messages.map((msg) =>
        msg.id === messageId ? { ...msg, text } : msg
      )

      return {
        sessions: {
          ...state.sessions,
          [chatId]: {
            ...session,
            messages: updatedMessages,
            updatedAt: Date.now(),
          },
        },
      }
    })
  },

  setLoading: (loading) => set({ isLoading: loading }),

  clearSessions: () => set({ sessions: {}, currentChatId: null }),
}))
