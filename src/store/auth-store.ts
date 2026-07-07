'use client';

import { create } from 'zustand';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  loading: boolean;
  /** 从服务端拉取当前会话用户。 */
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

/**
 * 客户端鉴权态：仅缓存当前用户资料（真实会话在 HttpOnly cookie + 服务端）。
 * 不在客户端存储任何凭据。
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  refresh: async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = (await res.json()) as { user: User | null };
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  setUser: (user) => set({ user, loading: false }),
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
  },
}));
