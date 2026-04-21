import { apiGet } from '../../api.client';
import type { GuestWithConfirmation } from '../../../model/wedding.types';

interface CompanionDto {
  id: number;
  name: string | null;
}

interface ConfirmationListDto {
  guestId: number;
  name: string;
  email: string | null;
  inviteCode: string;
  maxCompanions: number;
  attending: boolean | null;
  companionsCount: number;
  notes: string | null;
  confirmedAt: string | null;
  companions: CompanionDto[];
  isCompanion: boolean;
}

function mapConfirmation(dto: ConfirmationListDto): GuestWithConfirmation {
  const guestId = String(dto.guestId);
  const confirmation = dto.attending !== null ? {
    id: `conf-${guestId}`,
    guest_id: guestId,
    attending: dto.attending,
    companions_count: dto.companionsCount,
    notes: dto.notes ?? '',
  } : undefined;

  return {
    id: guestId,
    wedding_id: '',
    name: dto.name,
    email: dto.email ?? '',
    invite_code: dto.inviteCode,
    max_companions: dto.maxCompanions,
    confirmation,
    companions: dto.companions.map(c => ({
      id: String(c.id),
      guest_confirmation_id: `conf-${guestId}`,
      name: c.name ?? '',
    })),
  };
}

export async function fetchConfirmations(weddingId: number): Promise<GuestWithConfirmation[]> {
  const list = await apiGet<ConfirmationListDto[]>(`/api/weddings/${weddingId}/confirmations/list`);
  return list.map(mapConfirmation);
}
