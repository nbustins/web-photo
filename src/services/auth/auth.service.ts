import { apiPost, ApiError } from '../api.client';
import { errorMessage } from '../error-messages';
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
    if (err instanceof ApiError && err.status === 401) {
      return { success: false, error: 'Email o contrasenya incorrectes' };
    }
    return { success: false, error: errorMessage(err, 'Error desconegut') };
  }
}

export function logout(): void {
  clearSession();
}
