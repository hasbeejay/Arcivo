import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/v1';

const ACCESS_TOKEN_KEY = 'arcivo.access-token';
const REFRESH_TOKEN_KEY = 'arcivo.refresh-token';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${API_URL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );

  tokenStore.set(data.accessToken, data.refreshToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    // Only skip refresh on the endpoints that mint tokens; /auth/me must still refresh.
    const isTokenEndpoint = /\/auth\/(login|register|google|refresh)\b/.test(original?.url ?? '');

    if (error.response?.status === 401 && original && !original._retry && !isTokenEndpoint) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const accessToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new Event('arcivo:logout'));
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message) && message.length > 0) return message[0];
    if (typeof message === 'string' && message.length > 0 && message !== 'Internal server error') {
      return message;
    }
    // A dev proxy answers 500 with an empty body when the API process is down,
    // and an unreachable database surfaces the same way.
    if (status && status >= 500) {
      return 'The Arcivo server is unavailable. Make sure the API and database are running, then try again.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the Arcivo API. Make sure it is running on port 4000.';
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
