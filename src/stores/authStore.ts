import { create } from 'zustand';

interface AuthStore {
  token: string | null;
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
