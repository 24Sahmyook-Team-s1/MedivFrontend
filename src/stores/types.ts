import type { AxiosError } from "axios";

export interface AuthStore {
  user: any | null;
  isLoading: boolean;
  error: AxiosError | null;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  logout: () => Promise<boolean>;
  LocalLogin: (email: string, password: string) => Promise<string>;

}