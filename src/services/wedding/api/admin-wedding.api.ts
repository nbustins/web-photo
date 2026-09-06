import { apiGet, apiPostForm } from '../../api.client';

export interface AdminWedding {
  id: number;
  slug: string;
  title: string;
  eventDate: string | null;
  closingDate: string | null;
  createdAt: string;
  guestCount: number;
}

export function fetchAdminWeddings(): Promise<AdminWedding[]> {
  return apiGet<AdminWedding[]>('/api/weddings');
}

export interface CreateWeddingPayload {
  slug: string;
  title: string;
  eventDate?: string | null;   // YYYY-MM-DD
  closingDate?: string | null; // ISO datetime
  codeLength?: number;
}

/** POST /api/weddings — multipart: `wedding` = JSON payload, `guestFile` = optional Excel with guests. */
export function createAdminWedding(payload: CreateWeddingPayload, guestFile?: File): Promise<unknown> {
  const form = new FormData();
  form.append('wedding', JSON.stringify(payload));
  if (guestFile) form.append('guestFile', guestFile);
  return apiPostForm<unknown>('/api/weddings', form);
}
