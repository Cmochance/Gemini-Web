import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    // 重置 store
    useAppStore.getState().reset()
  })

  it('should have default values', () => {
    const { result } = renderHook(() => useAppStore())

    expect(result.current.theme).toBe('light')
    expect(result.current.hasContext).toBe(true)
    expect(result.current.sidebarCollapsed).toBe(false)
  })

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useAppStore())

    expect(result.current.sidebarCollapsed).toBe(false)

    act(() => {
      result.current.toggleSidebar()
    })

    expect(result.current.sidebarCollapsed).toBe(true)

    act(() => {
      result.current.toggleSidebar()
    })

    expect(result.current.sidebarCollapsed).toBe(false)
  })

  it('should set theme', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
  })

  it('should set token', () => {
    const { result } = renderHook(() => useAppStore())
    const testToken = 'test-token-123'

    act(() => {
      result.current.setToken(testToken)
    })

    expect(result.current.token).toBe(testToken)
  })
})
