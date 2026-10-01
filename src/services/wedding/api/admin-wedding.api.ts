import { apiGet, apiPostForm, apiPut } from '../../api.client';
import type { WeddingFeatures, UpdateWeddingSettingsPayload } from '../../../model/wedding.types';

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

export interface CreateWeddingOptions {
  features?: WeddingFeatures;
  hotelInfo?: string | null;
}

/**
 * POST /api/weddings — multipart: `wedding` = JSON payload, `guestFile` = optional Excel with guests,
 * optional `features` (JSON string) and `hotelInfo` (HTML string).
 */
export function createAdminWedding(
  payload: CreateWeddingPayload,
  guestFile?: File,
  options: CreateWeddingOptions = {},
): Promise<unknown> {
  const form = new FormData();
  form.append('wedding', JSON.stringify(payload));
  if (options.features) form.append('features', JSON.stringify(options.features));
  if (options.hotelInfo) form.append('hotelInfo', options.hotelInfo);
  if (guestFile) form.append('guestFile', guestFile);
  return apiPostForm<unknown>('/api/weddings', form);
}

export interface WeddingSettingsDto {
  id: number;
  slug: string;
  title: string;
  eventDate: string | null;
  closingDate: string | null;
  features: WeddingFeatures;
  hotelInfo: string | null;
}

/** PUT /api/weddings/{id}/settings — replaces the feature flags and the hotel info HTML. */
export function updateWeddingSettings(id: number, payload: UpdateWeddingSettingsPayload): Promise<WeddingSettingsDto> {
  return apiPut<WeddingSettingsDto, UpdateWeddingSettingsPayload>(`/api/weddings/${id}/settings`, payload);
}
