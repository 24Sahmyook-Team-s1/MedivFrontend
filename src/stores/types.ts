import type { AxiosError } from "axios";

export interface AuthStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  isLoading: boolean;
  error: AxiosError | null;
  isAuthenticated: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser: (user: any) => void;
  checkAuthStatus: () => Promise<boolean>;
  logout: () => Promise<boolean>;
  LocalLogin: (email: string, password: string) => Promise<string>;
  refreshToken: () => Promise<boolean>;

}