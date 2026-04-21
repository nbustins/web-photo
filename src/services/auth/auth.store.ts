import type { AuthUser, StoredSession } from './types';

const STORAGE_KEY = 'web-photo.auth';

function read(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function setSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getToken(): string | null {
  const session = read();
  if (!session) return null;
  if (new Date(session.expiresAt) <= new Date()) {
    clearSession();
    return null;
  }
  return session.token;
}

export function getUser(): AuthUser | null {
  const session = read();
  if (!session) return null;
  if (new Date(session.expiresAt) <= new Date()) {
    clearSession();
    return null;
  }
  return session.user;
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
