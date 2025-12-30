import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'auto' | 'dark' | 'light'

interface AppState {
  // 状态
  theme: Theme
  hasContext: boolean
  token: string
  sidebarCollapsed: boolean
  notice: string

  // Actions
  setTheme: (theme: Theme) => void
  setHasContext: (hasContext: boolean) => void
  setToken: (token: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setNotice: (notice: string) => void
  reset: () => void
}

const initialState = {
  theme: 'light' as Theme,
  hasContext: true,
  token: '',
  sidebarCollapsed: false,
  notice: '',
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),
      setHasContext: (hasContext) => set({ hasContext }),
      setToken: (token) => set({ token }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setNotice: (notice) => set({ notice }),
      reset: () => set(initialState),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        hasContext: state.hasContext,
        token: state.token,
      }),
    }
  )
)
