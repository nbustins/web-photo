import { apiGet, apiPost, ApiError } from '../../api.client';
import type { GuestWithWedding, Wedding, ConfirmationPayload } from '../../../model/wedding.types';

interface GuestInviteDto {
  id: number;
  name: string;
  inviteCode: string;
  maxCompanions: number;
  weddingTitle: string;
  eventDate: string | null;
  attending: boolean | null;
  companionsCount: number;
  notes: string | null;
}

interface ConfirmInviteRequest {
  attending: boolean;
  notes: string | null;
  companions: { name: string }[];
}

function mapGuestInvite(dto: GuestInviteDto, slug: string): GuestWithWedding {
  const wedding: Wedding = {
    id: slug,
    slug,
    title: dto.weddingTitle,
    event_date: dto.eventDate ?? '',
    closing_date: dto.eventDate ?? '',
  };
  return {
    id: String(dto.id),
    wedding_id: slug,
    name: dto.name,
    email: '',
    invite_code: dto.inviteCode,
    max_companions: dto.maxCompanions,
    wedding,
  };
}

export async function fetchGuestInvite(slug: string, code: string): Promise<GuestWithWedding | null> {
  try {
    const dto = await apiGet<GuestInviteDto>(
      `/api/public/weddings/${encodeURIComponent(slug)}/invites/${encodeURIComponent(code)}`,
    );
    return mapGuestInvite(dto, slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function postConfirmInvite(payload: ConfirmationPayload): Promise<void> {
  const body: ConfirmInviteRequest = {
    attending: payload.attending,
    notes: payload.notes || null,
    companions: payload.companion_names.map(name => ({ name })),
  };
  await apiPost<GuestInviteDto, ConfirmInviteRequest>(
    `/api/public/weddings/${encodeURIComponent(payload.slug)}/invites/${encodeURIComponent(payload.invite_code)}/confirm`,
    body,
  );
}
