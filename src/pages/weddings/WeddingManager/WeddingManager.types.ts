import type { SongRequest } from '../../../model/wedding.types';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface ManagerStats {
  totalGuests: number;
  confirmed: number;
  declined: number;
  pending: number;
  totalInvitations: number;
  respondedInvitations: number;
  /** Attending guests who take the hotel bus. */
  withTransport: number;
  /** Attending guests with at least one allergen. */
  withAllergens: number;
}

export interface InvitationSummary {
  invitationId: number;
  label: string;
  email: string | null;
  inviteCode: string;
  maxAddedGuests: number;
  notes: string | null;
  guests: {
    id: number;
    name: string;
    isPredefined: boolean;
    attending: boolean | null;
    usesTransportToHotel: boolean | null;
    allergens: string[];
  }[];
  songRequests: SongRequest[];
}

/** One song after aggregating every invitation's requests. */
export interface SongEntry {
  key: string;
  title: string;
  artist: string | null;
  /** Number of distinct invitations that proposed it. */
  votes: number;
  invitations: { id: number; label: string }[];
}
