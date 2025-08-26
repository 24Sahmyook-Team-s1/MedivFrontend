import axios, { AxiosError } from "axios";
import { create } from "zustand";
import type { AuthStore } from "../types";

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser: (user: any) => set({ user }),

  //Auth Check
  checkAuthStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        set({
          user: response.data.data,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
    return false;
  },

  
  refreshToken: async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/reissue`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        return true;
      }
      return false;
    } catch {
      set({ isAuthenticated: false });
      return false;
    }
  },

  LocalLogin: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      );
      
      // 로그인 성공 시 처리
      await get().checkAuthStatus();
      return "로그인 성공";
    } catch (error){
      set({ isLoading: false });
      const err = error as AxiosError;
      if(err?.status === 400){
          return "비밀번호가 틀립니다."
      }else if (err?.status === 502) {
          return "존재하지 않는 이메일 입니다."
      } else return "로그인 실패";
    }
  },


  //로그아웃 => 세션 삭제 && JWT 토큰 무효화 요청
  logout: async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      set({ user: null, isAuthenticated: false });
      return true;
    } catch {
      return false;
    }
  },

}));
