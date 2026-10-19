/**
 * Feature toggles for the features that carry behaviour. Information-only features
 * (hotel info) have no toggle: the presence of their content field is the enabled state.
 */
export interface WeddingFeatures {
  transportToHotel: boolean;
  songRequests: boolean;
  allergens: boolean;
}

export interface SongRequest {
  title: string;
  artist: string | null;
}

/**
 * Mirrors the API's `WeddingFeaturesContentDto`: rich-HTML content of the wedding.
 * `hotelInfo` is content-driven (the value itself is the state); the standalone fields
 * are always present, and the `*Phrase` fields are only sent while their feature is on.
 */
export interface WeddingContent {
  /** Sanitize before rendering. On the public invitation it is omitted when unset. */
  hotelInfo?: string | null;
  introductionText?: string | null;
  weddingPlace?: string | null;
  schedule?: string | null;
  donations?: string | null;
  contact?: string | null;
  /** Only present when features.songRequests is on. */
  songRequestsPhrase?: string | null;
  /** Only present when features.transportToHotel is on. */
  transportToHotelPhrase?: string | null;
}

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
  features?: WeddingFeatures;
  /** Admin-only; the public wedding endpoint never returns it. */
  content?: WeddingContent;
}

// --- Public invitation model ---

export interface InvitationGuest {
  id: number;
  name: string;
  isPredefined: boolean;
  attending: boolean | null;
  /** Present only when features.transportToHotel is on; null for non-attending guests. */
  usesTransportToHotel?: boolean | null;
  /** Present only when features.allergens is on. */
  allergens?: string[];
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
  features: WeddingFeatures;
  /** Sanitize the rich-HTML fields before rendering. */
  content?: WeddingContent;
  /** Present only when features.songRequests is on. */
  songRequests?: SongRequest[];
}

export interface ConfirmInvitationPayload {
  slug: string;
  inviteCode: string;
  notes: string | null;
  guests: {
    id: number;
    name: string;
    attending: boolean | null;
    usesTransportToHotel?: boolean | null;
    allergens?: string[];
  }[];
  songRequests?: SongRequest[];
}

// --- Admin model ---

export interface UpdateWeddingSettingsPayload {
  features: WeddingFeatures;
  content: WeddingContent;
}

export interface ConfirmationRow {
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
  usesTransportToHotel: boolean | null;
  allergens: string[];
}

/** Song requests of one invitation, as the manager reads them from `GET api/weddings/{id}`. */
export interface InvitationSongs {
  invitationId: number;
  label: string;
  songRequests: SongRequest[];
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
