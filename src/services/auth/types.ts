export interface AuthUser {
  id: number;
  email: string;
  role: string;
  weddingId: number | null;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface StoredSession {
  token: string;
  expiresAt: string;
  user: AuthUser;
}
