import { clearSession, saveSession, type ExtensionUser, type StoredSession } from './storage';

export const API_BASE = (
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() || 'http://localhost:4000/api/v1'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface LoginResponse {
  user: ExtensionUser;
  accessToken: string;
  refreshToken: string;
}

interface ExtensionTokenResponse {
  token: string;
  expiresIn: string;
  user: ExtensionUser;
}

export interface ExtensionFolder {
  id: string;
  name: string;
  color: string;
  description: string;
  count: number;
}

export interface SaveResourceInput {
  url: string;
  title: string;
  folderId?: string;
  tags?: string[];
}

export interface SavedResource {
  id: string;
  url: string;
  title: string;
  folderId: string | null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      `Cannot reach Arcivo at ${API_BASE}. Make sure the API is running.`,
      0,
    );
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const body = data as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message)
      ? body?.message[0]
      : body?.message || 'Something went wrong. Please try again.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

/** Parse JWT expiry without a decoding dependency. */
function expiryFromToken(token: string): number {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(normalized)) as { exp?: number };
    if (typeof json.exp === 'number') return json.exp * 1000;
  } catch {
    // fall through to a conservative default
  }
  return Date.now() + 30 * 24 * 60 * 60 * 1000;
}

export async function signIn(email: string, password: string): Promise<StoredSession> {
  const account = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const extension = await request<ExtensionTokenResponse>('/auth/extension-token', {
    method: 'POST',
    headers: { Authorization: `Bearer ${account.accessToken}` },
  });

  const session: StoredSession = {
    token: extension.token,
    user: extension.user,
    expiresAt: expiryFromToken(extension.token),
  };

  await saveSession(session);
  return session;
}

export async function fetchCurrentUser(token: string): Promise<ExtensionUser> {
  return request<ExtensionUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchFolders(token: string): Promise<ExtensionFolder[]> {
  return request<ExtensionFolder[]>('/folders', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function saveResource(
  token: string,
  input: SaveResourceInput,
): Promise<SavedResource> {
  return request<SavedResource>('/resources', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      url: input.url,
      title: input.title,
      ...(input.folderId ? { folderId: input.folderId } : {}),
      ...(input.tags && input.tags.length > 0 ? { tags: input.tags } : {}),
    }),
  });
}

export async function signOut(): Promise<void> {
  await clearSession();
}
