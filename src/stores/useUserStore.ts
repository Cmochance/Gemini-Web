import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name?: string
  nickName?: string
  avatar?: string
  integral: number
  vipUser: boolean
  inviteCode: string
  description?: string
  createdAt: string
}

interface UserState {
  user: User | null
  isAuthenticated: boolean

  // Actions
  setUser: (user: User | null) => void
  updateUserInfo: (updates: Partial<User>) => void
  updateIntegral: (integral: number) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      updateUserInfo: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateIntegral: (integral) =>
        set((state) => ({
          user: state.user ? { ...state.user, integral } : null,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'user-storage',
    }
  )
)
