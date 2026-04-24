export interface Wedding {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  hero_image?: string;
  background_image?: string;
  event_date: string;
  closing_date: string;
  manager_code?: string;
}

// --- Public invitation model ---

export interface InvitationGuest {
  id: number;
  name: string;
  isPredefined: boolean;
  attending: boolean | null;
}

export interface Invitation {
  id: number;
  label: string;
  inviteCode: string;
  maxAddedGuests: number;
  weddingTitle: string;
  eventDate: string | null;
  notes: string | null;
  slug: string;
  guests: InvitationGuest[];
}

export interface ConfirmInvitationPayload {
  slug: string;
  inviteCode: string;
  notes: string | null;
  guests: { id: number; name: string; attending: boolean | null }[];
}

// --- Admin model ---

export interface ConfirmationRow {
  invitationId: number;
  label: string;
  email: string | null;
  inviteCode: string;
  maxAddedGuests: number;
  notes: string | null;
  confirmedAt: string | null;
  guestId: number;
  guestName: string;
  isPredefined: boolean;
  guestAttending: boolean | null;
}

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  email: string;
  invite_code: string;
  max_companions: number;
}

export interface GuestConfirmation {
  id: string;
  guest_id: string;
  attending: boolean;
  companions_count: number;
  notes: string;
}

export interface GuestCompanion {
  id: string;
  guest_confirmation_id: string;
  name: string;
}

export interface GuestWithConfirmation extends Guest {
  confirmation?: GuestConfirmation;
  companions: GuestCompanion[];
}
