import { create } from 'zustand'
import { http } from '../lib/http'
import type { AuthStore } from './types'

const BYPASS = import.meta.env.VITE_BYPASS_AUTH === 'true'

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser: (user: any) => set({ user }),

  checkAuthStatus: async () => {
    if (BYPASS) {
      set({
        user: { id: 'dev', email: 'dev@local' } as any,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      return true
    }

    set({ isLoading: true, error: null })
    try {
      const res = await http.get('/auth/me')
      set({
        user: res.data?.data ?? null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      return true
    } catch (e: unknown) {
      // 401이면 토큰 재발급 시도
      const ok = await get().refreshToken()
      if (ok) {
        try {
          const res2 = await http.get('/auth/me')
          set({
            user: res2.data?.data ?? null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
          return false
        }
      }
      set({ user: null, isAuthenticated: false, isLoading: false })
      return false
    }
  },

  refreshToken: async () => {
    if (BYPASS) return true
    try {
      const res = await http.post('/auth/reissue', {})
      return res.status === 200
    } catch {
      set({ isAuthenticated: false })
      return false
    }
  },

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
      await http.post('/auth/login', { email, password })
      await get().checkAuthStatus()
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
      await http.post('/auth/logout', {})
      set({ user: null, isAuthenticated: false })
      return true
    } catch {
      return false
    }
  },
}))
