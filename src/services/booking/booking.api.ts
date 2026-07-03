import { apiGet, apiPost } from '../api.client';

export interface SessionType {
  id: number;
  sessionGroupId: number;
  name: string;
  durationMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
  availableFrom?: string | null;
  availableTo?: string | null;
}

export interface SessionGroupWithTypes {
  id: number;
  name: string;
  sessionTypes: SessionType[];
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

export function fetchSessionGroups(): Promise<SessionGroupWithTypes[]> {
  return apiGet<SessionGroupWithTypes[]>('/api/session-groups');
}

export function fetchAvailability(sessionTypeId: number, from: string, to: string): Promise<AvailabilityResponse> {
  return apiGet<AvailabilityResponse>(`/api/bookings/availability?sessionTypeId=${sessionTypeId}&from=${from}&to=${to}`);
}

export function createBooking(request: CreateBookingRequest): Promise<CreateBookingResult> {
  return apiPost<CreateBookingResult, CreateBookingRequest>('/api/bookings', request);
}
