import { apiGet, apiGetBlob, apiPost, apiPut, apiPatch, apiDelete } from '../api.client';
import type { ImageRightsConsent, SessionType } from './booking.api';

export type BookingStatus = 'Requested' | 'Confirmed' | 'Paid' | 'Cancelled';

export interface AdminBookingParticipant {
  id: number;
  name: string;
  age?: number | null;
}

export interface AdminBooking {
  id: number;
  sessionTypeId: number;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  dni: string;
  address: string;
  imageRights: ImageRightsConsent;
  notes?: string | null;
  confirmationToken: string;
  /** Null while the client has not signed: an attribute of the booking, not a status (API 010 FR-6). */
  contractSignedAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: AdminBookingParticipant[];
}

export interface SessionGroup {
  id: number;
  name: string;
}

// API serializes System.DayOfWeek as its name (global JsonStringEnumConverter).
export type Weekday = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

// Every range belongs to exactly one session type — there are no global ranges (API 001 §16).
export interface WeeklyAvailability {
  id: number;
  sessionTypeId: number;
  weekday: Weekday;
  startTime: string; // 'HH:mm:ss'
  endTime: string;
}

export interface WeeklyAvailabilityPayload {
  sessionTypeId: number;
  weekday: Weekday;
  startTime: string;
  endTime: string;
}

export interface BlockedPeriod {
  id: number;
  from: string; // 'YYYY-MM-DD'
  to: string;
  reason?: string | null;
}

export interface SessionTypePayload {
  sessionGroupId: number;
  name: string;
  durationMinutes: number;
  isActive: boolean;
  price: number;
  adviceText?: string | null;
  features: string[];
}

/**
 * The agenda's half of a session type (API spec 008): buffer and bookable window. A published
 * type with `onAgenda: false` has no row yet and cannot be reserved.
 */
export interface BookingSession {
  sessionTypeId: number;
  sessionTypeName: string;
  bufferMinutes: number;
  bookableFrom?: string | null;
  bookableTo?: string | null;
  onAgenda: boolean;
}

export interface BookingSessionPayload {
  bufferMinutes: number;
  bookableFrom?: string | null;
  bookableTo?: string | null;
}

// --- Bookings ---

export function fetchBookings(filter: {
  status?: BookingStatus;
  from?: string;
  to?: string;
}): Promise<AdminBooking[]> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.from) params.set('from', filter.from);
  if (filter.to) params.set('to', filter.to);
  const qs = params.toString();
  return apiGet<AdminBooking[]>(`/api/admin/bookings${qs ? `?${qs}` : ''}`);
}

export function updateBookingStatus(id: number, status: BookingStatus): Promise<AdminBooking> {
  return apiPatch<AdminBooking, { status: BookingStatus }>(`/api/admin/bookings/${id}`, { status });
}

export function fetchAdminContractPdf(bookingId: number): Promise<Blob> {
  return apiGetBlob(`/api/admin/bookings/${bookingId}/contract/pdf`);
}

export function resendBookingEmail(id: number, kind: 'requested' | 'confirmed'): Promise<{ delivered: boolean }> {
  return apiPost<{ delivered: boolean }>(`/api/admin/bookings/${id}/emails/${kind}`);
}

// --- Session groups ---

export function fetchSessionGroups(): Promise<SessionGroup[]> {
  return apiGet<SessionGroup[]>('/api/admin/session-groups');
}

export function createSessionGroup(name: string): Promise<SessionGroup> {
  return apiPost<SessionGroup, { name: string }>('/api/admin/session-groups', { name });
}

export function updateSessionGroup(id: number, name: string): Promise<SessionGroup> {
  return apiPut<SessionGroup, { name: string }>(`/api/admin/session-groups/${id}`, { name });
}

export function deleteSessionGroup(id: number): Promise<void> {
  return apiDelete(`/api/admin/session-groups/${id}`);
}

// --- Session types ---

export function fetchSessionTypes(): Promise<SessionType[]> {
  return apiGet<SessionType[]>('/api/admin/session-types');
}

export function createSessionType(payload: SessionTypePayload): Promise<SessionType> {
  return apiPost<SessionType, SessionTypePayload>('/api/admin/session-types', payload);
}

export function updateSessionType(id: number, payload: SessionTypePayload): Promise<SessionType> {
  return apiPut<SessionType, SessionTypePayload>(`/api/admin/session-types/${id}`, payload);
}

export function deleteSessionType(id: number): Promise<void> {
  return apiDelete(`/api/admin/session-types/${id}`);
}

// --- Booking sessions (agenda side of a session type) ---

export function fetchBookingSessions(): Promise<BookingSession[]> {
  return apiGet<BookingSession[]>('/api/admin/booking-sessions');
}

export function upsertBookingSession(
  sessionTypeId: number,
  payload: BookingSessionPayload,
): Promise<BookingSession> {
  return apiPut<BookingSession, BookingSessionPayload>(`/api/admin/booking-sessions/${sessionTypeId}`, payload);
}

// --- Weekly availability ---

export function fetchAvailabilityRanges(sessionTypeId?: number): Promise<WeeklyAvailability[]> {
  const qs = sessionTypeId ? `?sessionTypeId=${sessionTypeId}` : '';
  return apiGet<WeeklyAvailability[]>(`/api/admin/availability${qs}`);
}

export function createAvailabilityRange(payload: WeeklyAvailabilityPayload): Promise<WeeklyAvailability> {
  return apiPost<WeeklyAvailability, WeeklyAvailabilityPayload>('/api/admin/availability', payload);
}

export function updateAvailabilityRange(
  id: number,
  payload: WeeklyAvailabilityPayload,
): Promise<WeeklyAvailability> {
  return apiPut<WeeklyAvailability, WeeklyAvailabilityPayload>(`/api/admin/availability/${id}`, payload);
}

export function deleteAvailabilityRange(id: number): Promise<void> {
  return apiDelete(`/api/admin/availability/${id}`);
}

// --- Blocked periods ---

export function fetchBlockedPeriods(): Promise<BlockedPeriod[]> {
  return apiGet<BlockedPeriod[]>('/api/admin/blocked-periods');
}

export function createBlockedPeriod(payload: {
  from: string;
  to: string;
  reason?: string;
}): Promise<BlockedPeriod> {
  return apiPost<BlockedPeriod, typeof payload>('/api/admin/blocked-periods', payload);
}

export function deleteBlockedPeriod(id: number): Promise<void> {
  return apiDelete(`/api/admin/blocked-periods/${id}`);
}

// Note: POST /api/admin/emails/test is Postman-only (template preview), not exposed in the panel.
