import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface ChatModel {
  id: string
  name: string
  description: string
  contextWindow: number
}

const api = {
  async getModels() {
    const res = await fetch('/api/models')
    if (!res.ok) throw new Error('获取模型列表失败')
    return res.json()
  },
}

// 获取可用模型列表
export function useModels() {
  return useQuery<ChatModel[]>({
    queryKey: ['models'],
    queryFn: api.getModels,
    staleTime: 10 * 60 * 1000, // 10分钟缓存
  })
}
