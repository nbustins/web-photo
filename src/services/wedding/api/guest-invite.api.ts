import { apiGet, apiPost, ApiError } from '../../api.client';
import type { Invitation, ConfirmInvitationPayload } from '../../../model/wedding.types';

interface InvitationGuestDto {
  id: number;
  name: string;
  isPredefined: boolean;
  attending: boolean | null;
}

interface InvitationDto {
  id: number;
  label: string;
  inviteCode: string;
  maxAddedGuests: number;
  weddingTitle: string;
  eventDate: string | null;
  notes: string | null;
  guests: InvitationGuestDto[];
}

interface ConfirmInvitationRequest {
  notes: string | null;
  guests: { id: number | null; name: string; attending: boolean | null }[];
}

function mapInvitation(dto: InvitationDto, slug: string): Invitation {
  return {
    id: dto.id,
    label: dto.label,
    inviteCode: dto.inviteCode,
    maxAddedGuests: dto.maxAddedGuests,
    weddingTitle: dto.weddingTitle,
    eventDate: dto.eventDate,
    notes: dto.notes,
    slug,
    guests: dto.guests.map(g => ({
      id: g.id,
      name: g.name,
      isPredefined: g.isPredefined,
      attending: g.attending,
    })),
  };
}

export async function fetchGuestInvite(slug: string, code: string): Promise<Invitation | null> {
  try {
    const dto = await apiGet<InvitationDto>(
      `/api/public/weddings/${encodeURIComponent(slug)}/invites/${encodeURIComponent(code)}`,
    );
    return mapInvitation(dto, slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function postConfirmInvite(payload: ConfirmInvitationPayload): Promise<Invitation> {
  const body: ConfirmInvitationRequest = {
    notes: payload.notes,
    guests: payload.guests.map(g => ({ id: g.id, name: g.name, attending: g.attending })),
  };
  const dto = await apiPost<InvitationDto, ConfirmInvitationRequest>(
    `/api/public/weddings/${encodeURIComponent(payload.slug)}/invites/${encodeURIComponent(payload.inviteCode)}/confirm`,
    body,
  );
  return mapInvitation(dto, payload.slug);
}
