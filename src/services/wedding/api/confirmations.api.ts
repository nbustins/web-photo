import { apiGet } from '../../api.client';
import type { ConfirmationRow } from '../../../model/wedding.types';

interface ConfirmationListDto {
  invitationId: number;
  label: string;
  email: string | null;
  inviteCode: string;
  maxAddedGuests: number;
  notes: string | null;
  guestId: number;
  guestName: string;
  isPredefined: boolean;
  guestAttending: boolean | null;
}

function mapRow(dto: ConfirmationListDto): ConfirmationRow {
  return {
    invitationId: dto.invitationId,
    label: dto.label,
    email: dto.email,
    inviteCode: dto.inviteCode,
    maxAddedGuests: dto.maxAddedGuests,
    notes: dto.notes,
    guestId: dto.guestId,
    guestName: dto.guestName,
    isPredefined: dto.isPredefined,
    guestAttending: dto.guestAttending,
  };
}

export async function fetchConfirmations(weddingId: number): Promise<ConfirmationRow[]> {
  const list = await apiGet<ConfirmationListDto[]>(`/api/weddings/${weddingId}/confirmations/list`);
  return list.map(mapRow);
}
