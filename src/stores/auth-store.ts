import { create } from 'zustand';

export interface UserInfo {
  id?: number | string;
  username?: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  menu: unknown[];
  setToken: (token: string | null) => void;
  setUser: (user: UserInfo | null) => void;
  setMenu: (menu: unknown[]) => void;
  resetAuth: () => void;
}

const tokenKey = 'esimulate_token';

export const useAuthStore = create<AuthState>((set) => ({
  token: sessionStorage.getItem(tokenKey),
  user: null,
  menu: [],
  setToken: (token) => {
    if (token) {
      sessionStorage.setItem(tokenKey, token);
    } else {
      sessionStorage.removeItem(tokenKey);
    }
    set({ token });
  },
  setUser: (user) => set({ user }),
  setMenu: (menu) => set({ menu }),
  resetAuth: () => {
    sessionStorage.removeItem(tokenKey);
    set({ token: null, user: null, menu: [] });
  },
}));
