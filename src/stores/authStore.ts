import { create } from 'zustand';

interface AuthStore {
  /** JWT 액세스 토큰 — 메모리에만 저장 (localStorage 사용 금지, NFR-S-01) */
  token: string | null;
  /** 토큰 만료 시각 (Unix ms). null 이면 만료 정보 없음 */
  expiresAt: number | null;

  setToken: (token: string, expiresIn?: number) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  expiresAt: null,

  setToken: (token, expiresIn) =>
    set({
      token,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
    }),

  clearToken: () => set({ token: null, expiresAt: null }),

  isAuthenticated: () => {
    const { token, expiresAt } = get();
    if (!token) return false;
    if (expiresAt && Date.now() > expiresAt) return false;
    return true;
  },
}));
