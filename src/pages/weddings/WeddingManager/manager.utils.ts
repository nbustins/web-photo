import type { ConfirmationRow, InvitationSongs } from '../../../model/wedding.types';
import type { InvitationSummary, ManagerStats } from './WeddingManager.types';

export const buildSummary = (
  rows: ConfirmationRow[],
  invitationId: number,
  invitationSongs: InvitationSongs[] = [],
): InvitationSummary | null => {
  const matching = rows.filter(r => r.invitationId === invitationId);
  if (!matching.length) return null;
  const first = matching[0];
  return {
    invitationId: first.invitationId,
    label: first.label,
    email: first.email,
    inviteCode: first.inviteCode,
    maxAddedGuests: first.maxAddedGuests,
    notes: first.notes,
    guests: matching.map(r => ({
      id: r.guestId,
      name: r.guestName,
      isPredefined: r.isPredefined,
      attending: r.guestAttending,
      usesTransportToHotel: r.usesTransportToHotel,
      allergens: r.allergens,
    })),
    songRequests: invitationSongs.find(i => i.invitationId === invitationId)?.songRequests ?? [],
  };
};

export const hasTransport = (row: ConfirmationRow): boolean =>
  row.guestAttending === true && row.usesTransportToHotel === true;

export const hasAllergens = (row: ConfirmationRow): boolean =>
  row.guestAttending === true && row.allergens.length > 0;

export const computeStats = (rows: ConfirmationRow[]): ManagerStats => {
  const totalGuests = rows.length;
  const confirmed = rows.filter(r => r.guestAttending === true).length;
  const declined = rows.filter(r => r.guestAttending === false).length;
  const pending = rows.filter(r => r.guestAttending === null).length;
  const invitationIds = new Set(rows.map(r => r.invitationId));
  const respondedIds = new Set(rows.filter(r => r.guestAttending !== null).map(r => r.invitationId));
  return {
    totalGuests,
    confirmed,
    declined,
    pending,
    totalInvitations: invitationIds.size,
    respondedInvitations: respondedIds.size,
    withTransport: rows.filter(hasTransport).length,
    withAllergens: rows.filter(hasAllergens).length,
  };
};
