import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '@/stores/useUserStore'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  code: string
}

// API 请求函数 (需要根据实际后端接口调整)
const api = {
  async login(params: LoginParams) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!res.ok) throw new Error('登录失败')
    return res.json()
  },

  async register(params: RegisterParams) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!res.ok) throw new Error('注册失败')
    return res.json()
  },

  async getUserProfile(token: string) {
    const res = await fetch('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('获取用户信息失败')
    return res.json()
  },

  async updateProfile(token: string, data: Partial<any>) {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('更新失败')
    return res.json()
  },
}

// 获取用户信息
export function useUser() {
  const token = useUserStore((state) => state.user?.id)

  return useQuery({
    queryKey: ['user', token],
    queryFn: () => api.getUserProfile(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  })
}

// 登录
export function useLogin() {
  const setUser = useUserStore((state) => state.setUser)

  return useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setUser(data.user)
    },
  })
}

// 注册
export function useRegister() {
  const setUser = useUserStore((state) => state.setUser)

  return useMutation({
    mutationFn: api.register,
    onSuccess: (data) => {
      setUser(data.user)
    },
  })
}

// 更新用户信息
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const token = useUserStore((state) => state.user?.id)

  return useMutation({
    mutationFn: (data: Partial<any>) => api.updateProfile(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}
