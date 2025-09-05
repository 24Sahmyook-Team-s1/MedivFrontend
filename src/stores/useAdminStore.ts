import { create } from "zustand";
import { http } from "../lib/http";

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export type AdminLog = {
  id: string;
  time: string; // ISO string
  level: LogLevel;
  actor?: string;
  ip?: string;
  message: string;
  meta?: Record<string, any>;
};

export type UserRole = "ADMIN" | "STAFF";
export type UserStatus = "ACTIVE" | "INACTIVE";

export type AdminUser = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

type AdminState = {
  // logs
  logs: AdminLog[];
  totalLogs: number;
  isLoadingLogs: boolean;
  fetchLogs: (params?: {
    level?: LogLevel | "ALL";
    keyword?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
  }) => Promise<void>;

  // issue id
  isIssuing: boolean;
  issueResult: { email: string; issuedAt: string } | null;
  issueId: (form: {
    name: string;
    email: string;
    role: UserRole;
    tempPassword?: string;
    status: string;
    dept: string;
  }) => Promise<void>;

  // users
  users: AdminUser[];
  usersTotal: number;
  isLoadingUsers: boolean;
  fetchUsers: (params?: {
    keyword?: string;
    role?: UserRole | "ALL";
    status?: UserStatus | "ALL";
    page?: number;
    size?: number;
  }) => Promise<void>;
  updateUser: (userId: string, role: UserRole, displayName: string, dept: string, status:UserStatus ) => Promise<void>;
  toggleUserActive: (userId: string, next: UserStatus) => Promise<void>;
  resetPassword: (userId: string) => Promise<{ tempPassword: string } | null>;
  deleteUser: (email: string) => Promise<void>;
};

export const useAdminStore = create<AdminState>((set, get) => ({
  // logs
  logs: [],
  totalLogs: 0,
  isLoadingLogs: false,
  async fetchLogs(params) {
    set({ isLoadingLogs: true })
    try {
      const res = await http.get('/logs', { params })
      const { items, total } = res.data || { items: [], total: 0 }
      set({ logs: items, totalLogs: total })
    } catch (e) {
      console.error('[fetchLogs] failed', e)
    } finally {
      set({ isLoadingLogs: false })
    }
  },

  // issue id
  isIssuing: false,
  issueResult: null,
  async issueId(form) {
    set({ isIssuing: true, issueResult: null })
    try {
      const res = await http.post('/users', form)
      const data = res.data || { email: form.email, issuedAt: new Date().toISOString() }
      set({ issueResult: data })
    } catch (e) {
      console.error('[issueId] failed', e)
    } finally {
      set({ isIssuing: false })
    }
  },

  // users
  users: [],
  usersTotal: 0,
  isLoadingUsers: false,
  async fetchUsers() {
    set({ isLoadingUsers: true })
    try {
      const res = await http.get('/users')
      const items = res.data.content
      set({ users: items })
      console.log(useAdminStore.getState().users);
    } catch (e) {
      console.error('[fetchUsers] failed', e)
    } finally {
      set({ isLoadingUsers: false })
    }
  },

  async updateUser(id, role, displayName, dept, status) {
    const prev = get().users
    set({ users: prev.map(u => u.id === id ? { ...u, role } : u) }) // optimistic
    try {
      await http.put(`/users/${encodeURIComponent(id)}`, { displayName, dept, role, status })
    } catch (e) {
      console.error('[updateUser] failed', e)
      set({ users: prev }) // rollback
    }
  },

  deleteUser: async (email: string) => {
    try{
      await http.delete(`/users/${email}/hard`)
    } catch (e) {
      console.error('[UserDelete Fail]',e)
    }
  },

  async toggleUserActive(id, next) {
    const prev = get().users
    set({ users: prev.map(u => u.id === id ? { ...u, status: next } : u) }) // optimistic
    try {
      await http.patch(`/users/${encodeURIComponent(id)}`, { status: next })
    } catch (e) {
      console.error('[toggleUserActive] failed', e)
      set({ users: prev }) // rollback
    }
  },

  async resetPassword(userId) {
    try {
      const res = await http.post(`/users/${encodeURIComponent(userId)}/reset-password`)
      return res.data || null // { tempPassword }
    } catch (e) {
      console.error('[resetPassword] failed', e)
      return null
    }
  },
}))