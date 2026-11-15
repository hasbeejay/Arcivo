export interface ExtensionUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface StoredSession {
  token: string;
  user: ExtensionUser;
  /** Unix epoch milliseconds. */
  expiresAt: number;
}

const SESSION_KEY = 'arcivo.session';

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

function readLocal(key: string): Promise<unknown> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (items) => resolve(items[key]));
  });
}

function writeLocal(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

function removeLocal(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, () => resolve());
  });
}

export async function loadSession(): Promise<StoredSession | null> {
  const raw = hasChromeStorage()
    ? await readLocal(SESSION_KEY)
    : window.localStorage.getItem(SESSION_KEY)
      ? JSON.parse(window.localStorage.getItem(SESSION_KEY) as string)
      : null;

  if (!raw || typeof raw !== 'object') return null;

  const session = raw as Partial<StoredSession>;
  if (typeof session.token !== 'string' || !session.token || typeof session.expiresAt !== 'number') {
    await clearSession();
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    await clearSession();
    return null;
  }

  return session as StoredSession;
}

export async function saveSession(session: StoredSession): Promise<void> {
  if (hasChromeStorage()) {
    await writeLocal(SESSION_KEY, session);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  if (hasChromeStorage()) {
    await removeLocal(SESSION_KEY);
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}
