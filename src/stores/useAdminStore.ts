import { create } from 'zustand'
import { http } from '../lib/http'

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

export type AdminLog = {
  id: string
  time: string // ISO string
  level: LogLevel
  actor?: string
  ip?: string
  message: string
  meta?: Record<string, any>
}

export type LogQuery = {
  page?: number
  size?: number
  level?: LogLevel | 'ALL'
  keyword?: string
  dateFrom?: string // ISO date (yyyy-mm-dd)
  dateTo?: string   // ISO date (yyyy-mm-dd)
}

type IssueForm = {
  userId: string
  displayName: string
  email: string
  role: 'ADMIN' | 'RAD' | 'TECH' | 'STAFF'
  passWord?: string
  status: string
}

type AdminState = {
  // logs
  logs: AdminLog[]
  total: number
  isLoadingLogs: boolean
  lastQuery: LogQuery
  fetchLogs: (q?: Partial<LogQuery>) => Promise<void>

  // issue id
  isIssuing: boolean
  issueResult: { userId: string; issuedAt: string } | null
  issueId: (form: IssueForm) => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  logs: [],
  total: 0,
  isLoadingLogs: false,
  lastQuery: { page: 1, size: 20, level: 'ALL' },

  async fetchLogs(q) {
    const prev = get().lastQuery
    const query: LogQuery = { ...prev, ...q }
    set({ isLoadingLogs: true, lastQuery: query })
    try {
      // 백엔드 예시 엔드포인트: GET /admin/logs
      // params: page, size, level, keyword, dateFrom, dateTo
      const res = await http.get('/admin/logs', { params: query })
      const { items, total } = res.data || { items: [], total: 0 }
      set({ logs: items, total })
    } catch (e) {
      console.error('[fetchLogs] failed', e)
      // 안전장치: 목 데이터
      const now = new Date().toISOString()
      const mock: AdminLog[] = Array.from({ length: 8 }).map((_, i) => ({
        id: 'mock-' + i,
        time: now,
        level: (['INFO','WARN','ERROR','DEBUG'] as LogLevel[])[i % 4],
        actor: 'system',
        ip: '127.0.0.1',
        message: `mock log message ${i}`,
      }))
      set({ logs: mock, total: mock.length })
    } finally {
      set({ isLoadingLogs: false })
    }
  },

  isIssuing: false,
  issueResult: null,
  async issueId(form) {
    set({ isIssuing: true, issueResult: null })
    try {
      // 백엔드 예시 엔드포인트: POST /admin/users
      // body: { userId, name, email, role, tempPassword }
      const res = await http.post('/users', form)
      const data = res.data || { email: form.email, displayName: form.displayName, dept: 'Doc', role: form.role, status: 'ACTIVE', passWord: form.passWord}
      set({ issueResult: data })
    } catch (e) {
      console.error('[issueId] failed', e)
      // 최소 성공 시나리오 모킹
      set({ issueResult: { userId: form.userId, issuedAt: new Date().toISOString() } })
    } finally {
      set({ isIssuing: false })
    }
  },
}))

