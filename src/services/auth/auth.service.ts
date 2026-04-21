import { apiPost, ApiError } from '../api.client';
import { clearSession, setSession } from './auth.store';
import type { AuthUser, LoginResponse } from './types';

export async function login(
  email: string,
  password: string,
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  try {
    const response = await apiPost<LoginResponse>('/api/auth/login', { email, password });
    setSession({
      token: response.token,
      expiresAt: response.expiresAt,
      user: response.user,
    });
    return { success: true, user: response.user };
  } catch (err) {
    if (err instanceof ApiError) {
      const message = err.status === 401 ? 'Email o contrasenya incorrectes' : err.message;
      return { success: false, error: message };
    }
    return { success: false, error: err instanceof Error ? err.message : 'Error desconegut' };
  }
}

export function logout(): void {
  clearSession();
}
