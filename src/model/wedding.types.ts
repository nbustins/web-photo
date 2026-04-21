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

export interface GuestWithWedding extends Guest {
  wedding: Wedding;
}

export interface GuestWithConfirmation extends Guest {
  confirmation?: GuestConfirmation;
  companions: GuestCompanion[];
}

export interface ConfirmationPayload {
  guest_id: string;
  slug: string;
  invite_code: string;
  attending: boolean;
  companions_count: number;
  companion_names: string[];
  notes: string;
}
