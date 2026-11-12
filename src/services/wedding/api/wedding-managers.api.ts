import { apiDelete, apiGet, apiPost, apiPut } from '../../api.client';

/** One wedding-manager account. The API never returns a password or hash. */
export interface WeddingManager {
  id: number;
  email: string | null;
  weddingId: number;
  createdAt: string;
}

export interface CreateWeddingManagerPayload {
  email: string;
  password: string;
}

/** GET /api/weddings/{weddingId}/managers — admin only; ordered by createdAt then id. */
export function fetchWeddingManagers(weddingId: number): Promise<WeddingManager[]> {
  return apiGet<WeddingManager[]>(`/api/weddings/${weddingId}/managers`);
}

/** POST /api/weddings/{weddingId}/managers — the role is always WeddingManager, set by the API. */
export function createWeddingManager(
  weddingId: number,
  payload: CreateWeddingManagerPayload,
): Promise<WeddingManager> {
  return apiPost<WeddingManager, CreateWeddingManagerPayload>(
    `/api/weddings/${weddingId}/managers`,
    payload,
  );
}

/** PUT /api/weddings/{weddingId}/managers/{userId} — changes the email only. */
export function updateWeddingManagerEmail(
  weddingId: number,
  userId: number,
  email: string,
): Promise<WeddingManager> {
  return apiPut<WeddingManager, { email: string }>(
    `/api/weddings/${weddingId}/managers/${userId}`,
    { email },
  );
}

/** POST /api/weddings/{weddingId}/managers/{userId}/reset-password — 204, sets the value directly. */
export function resetWeddingManagerPassword(
  weddingId: number,
  userId: number,
  newPassword: string,
): Promise<void> {
  return apiPost<void, { newPassword: string }>(
    `/api/weddings/${weddingId}/managers/${userId}/reset-password`,
    { newPassword },
  );
}

/** DELETE /api/weddings/{weddingId}/managers/{userId} — 204, hard delete; the email is reusable. */
export function deleteWeddingManager(weddingId: number, userId: number): Promise<void> {
  return apiDelete<void>(`/api/weddings/${weddingId}/managers/${userId}`);
}
