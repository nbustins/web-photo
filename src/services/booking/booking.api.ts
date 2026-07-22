import { apiGet, apiPost } from '../api.client';

/**
 * A catalog session type: what is sold, including the pricing-card content (API spec 007).
 * Buffer and the bookable window are not here — they belong to the agenda (API spec 008).
 */
export interface SessionType {
  id: number;
  sessionGroupId: number;
  name: string;
  durationMinutes: number;
  isActive: boolean;
  price: number;
  adviceText?: string | null;
  features: string[];
}

export interface SessionGroupWithTypes {
  id: number;
  name: string;
  sessionTypes: SessionType[];
}

/** What the booking flow may offer: published AND on the agenda AND inside its bookable window. */
export interface BookableSessionType {
  id: number;
  sessionGroupId: number;
  name: string;
  durationMinutes: number;
}

export interface BookableSessionGroup {
  id: number;
  name: string;
  sessionTypes: BookableSessionType[];
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
}

export interface AvailabilityDay {
  date: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilityResponse {
  sessionTypeId: number;
  durationMinutes: number;
  timezone: string;
  days: AvailabilityDay[];
}

export type ImageRightsConsent = 'GrantAll' | 'DenyAll' | 'GrantMineDenyMinors';

export interface CreateBookingRequest {
  sessionTypeId: number;
  startAt: string;
  reserver: {
    name: string;
    email?: string;
    phone: string;
    dni: string;
    address: string;
  };
  participants: { name: string; age?: number }[];
  imageRights: ImageRightsConsent;
  notes?: string;
}

export interface CreateBookingResult {
  id: number;
  confirmationToken: string;
}

/** Full published catalog, card content included. */
export function fetchSessionGroups(): Promise<SessionGroupWithTypes[]> {
  return apiGet<SessionGroupWithTypes[]>('/api/session-groups');
}

/** One service page's pricing cards. */
export function fetchSessionTypesByGroup(sessionGroupId: number): Promise<SessionType[]> {
  return apiGet<SessionType[]>(`/api/session-groups/${sessionGroupId}/session-types`);
}

/**
 * Booking flow only. Served by the Booking module, not the catalog: a published session type is
 * not necessarily reservable (API spec 008 QS5).
 */
export function fetchBookableSessionGroups(): Promise<BookableSessionGroup[]> {
  return apiGet<BookableSessionGroup[]>('/api/booking/session-groups');
}

export function fetchAvailability(sessionTypeId: number, from: string, to: string): Promise<AvailabilityResponse> {
  return apiGet<AvailabilityResponse>(`/api/bookings/availability?sessionTypeId=${sessionTypeId}&from=${from}&to=${to}`);
}

export function createBooking(request: CreateBookingRequest): Promise<CreateBookingResult> {
  return apiPost<CreateBookingResult, CreateBookingRequest>('/api/bookings', request);
}
