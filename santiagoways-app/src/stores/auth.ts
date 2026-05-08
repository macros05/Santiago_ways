import { create } from 'zustand';
import { api, clearTokens, setTokens } from '@lib/api';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string | null;
  bio?: string | null;
  nationality?: string | null;
  timesCompleted?: number;
  totalKm?: number;
  isOnCamino?: boolean;
  privateAccount?: boolean;
  shareLocation?: boolean;
  language?: 'es' | 'en';
  plan?: 'free' | 'buen_camino' | 'compostelero';
};

type AuthState = {
  user: AuthUser | null;
  isReady: boolean;
  bootstrap: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    username: string;
    nationality?: string;
  }) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithApple: (input: { identityToken: string; name?: string; email?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: AuthUser) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isReady: false,

  bootstrap: async () => {
    try {
      const me = await api<AuthUser>('/auth/me');
      set({ user: me, isReady: true });
    } catch {
      set({ user: null, isReady: true });
    }
  },

  signIn: async (email, password) => {
    const data = await api<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    await setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user });
  },

  register: async (input) => {
    const data = await api<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', { method: 'POST', body: input, auth: false });
    await setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user });
  },

  signInWithGoogle: async (idToken) => {
    const data = await api<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>('/auth/google', { method: 'POST', body: { idToken }, auth: false });
    await setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user });
  },

  signInWithApple: async ({ identityToken, name, email }) => {
    const body: Record<string, unknown> = { identityToken };
    if (name || email) body.user = { ...(name ? { name } : {}), ...(email ? { email } : {}) };
    const data = await api<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>('/auth/apple', { method: 'POST', body: body as never, auth: false });
    await setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user });
  },

  signOut: async () => {
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
    } catch {
      // ignore
    }
    await clearTokens();
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
