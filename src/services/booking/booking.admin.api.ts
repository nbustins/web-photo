import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../api.client';
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

export interface WeeklyAvailability {
  id: number;
  weekday: Weekday;
  startTime: string; // 'HH:mm:ss'
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
  bufferMinutes: number;
  isActive: boolean;
  availableFrom?: string | null;
  availableTo?: string | null;
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

// --- Weekly availability ---

export function fetchAvailabilityRanges(): Promise<WeeklyAvailability[]> {
  return apiGet<WeeklyAvailability[]>('/api/admin/availability');
}

export function createAvailabilityRange(payload: {
  weekday: Weekday;
  startTime: string;
  endTime: string;
}): Promise<WeeklyAvailability> {
  return apiPost<WeeklyAvailability, typeof payload>('/api/admin/availability', payload);
}

export function updateAvailabilityRange(
  id: number,
  payload: { weekday: Weekday; startTime: string; endTime: string },
): Promise<WeeklyAvailability> {
  return apiPut<WeeklyAvailability, typeof payload>(`/api/admin/availability/${id}`, payload);
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
