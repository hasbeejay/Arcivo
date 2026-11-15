import { create } from 'zustand';
import { api, apiErrorMessage, tokenStore } from '../lib/api';
import type { User } from '../types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  busy: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  busy: false,
  error: null,

  bootstrap: async () => {
    if (!tokenStore.getAccess() && !tokenStore.getRefresh()) {
      set({ user: null, status: 'unauthenticated' });
      return;
    }

    try {
      const { data } = await api.get<User>('/auth/me');
      set({ user: data, status: 'authenticated' });
    } catch {
      tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login: async (email, password) => {
    set({ busy: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      tokenStore.set(data.accessToken, data.refreshToken);
      set({ user: data.user, status: 'authenticated', busy: false, error: null });
    } catch (error) {
      set({ busy: false, error: apiErrorMessage(error) });
    }
  },

  register: async (fullName, email, password) => {
    set({ busy: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { fullName, email, password });
      tokenStore.set(data.accessToken, data.refreshToken);
      set({ user: data.user, status: 'authenticated', busy: false, error: null });
    } catch (error) {
      set({ busy: false, error: apiErrorMessage(error) });
    }
  },

  loginWithGoogle: async (credential) => {
    set({ busy: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/auth/google', { credential });
      tokenStore.set(data.accessToken, data.refreshToken);
      set({ user: data.user, status: 'authenticated', busy: false, error: null });
    } catch (error) {
      set({ busy: false, error: apiErrorMessage(error) });
    }
  },

  logout: () => {
    tokenStore.clear();
    set({ user: null, status: 'unauthenticated', busy: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
