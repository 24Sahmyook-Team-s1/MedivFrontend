import { create } from 'zustand'
import { http } from '../lib/http'
import type { AuthStore } from './types'

const BYPASS = import.meta.env.VITE_BYPASS_AUTH === 'true'

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  
  setUser: (user: any) => set({ user }),

  LocalLogin: async (email: string, password: string) => {
    if (BYPASS) {
      set({
        isAuthenticated: true,
        user: { id: 'dev', email: 'dev@local' } as any,
        isLoading: false,
        error: null,
      })
      return '로그인 성공(개발 우회)'
    }

    set({ isLoading: true, error: null })
    try {
      await http.post('/users/login', { email, password })
      const resinfo = await http.get(`/users/${email}`)
      set({
        isAuthenticated: true,
        user: resinfo.data
      })
      
      console.log(resinfo.data);
      return '로그인 성공'
    } catch (error: any) {
      set({ isLoading: false })
      const status = error?.response?.status
      if (status === 400) return '비밀번호가 틀립니다.'
      if (status === 502) return '존재하지 않는 이메일 입니다.'
      return '로그인 실패'
    }
  },

  logout: async () => {
    if (BYPASS) {
      set({ user: null, isAuthenticated: false })
      return true
    }
    try {
      await http.post('/users/logout', {})
      set({ user: null, isAuthenticated: false })
      return true
    } catch {
      return false
    }
  },
}))
