import { apiGet, apiGetBlob, apiPost } from '../api.client';

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

// --- Booking view + contract, by confirmation token (API spec 010) ---

export type BookingStatus = 'Requested' | 'Confirmed' | 'Paid' | 'Cancelled';

export interface BookingByToken {
  id: number;
  sessionTypeId: number;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  clientName: string;
  imageRights: ImageRightsConsent;
  confirmationToken: string;
  contractSignedAt: string | null;
}

/** The contract's placeholder values, formatted by the API so page and PDF always agree. */
export interface ContractFields {
  clientName: string;
  clientDocumentNumber: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  packName: string;
  packPayPrepaid: string;
  packPayPending: string;
  checkAuthorization: string;
}

export interface ContractSection {
  title: string;
  paragraphs: string[];
}

export interface BookingContract {
  signed: boolean;
  signedAtUtc: string | null;
  templateVersion: string;
  imageRights: ImageRightsConsent;
  fields: ContractFields;
  sections: ContractSection[];
}

export interface SignContractRequest {
  signatureImagePngBase64: string;
  imageRights: ImageRightsConsent;
}

export function fetchBookingByToken(token: string): Promise<BookingByToken> {
  return apiGet<BookingByToken>(`/api/bookings/${token}`);
}

export function fetchBookingContract(token: string): Promise<BookingContract> {
  return apiGet<BookingContract>(`/api/bookings/${token}/contract`);
}

/** One shot: the contract cannot be signed twice (409 afterwards). */
export function signBookingContract(token: string, request: SignContractRequest): Promise<void> {
  return apiPost<void, SignContractRequest>(`/api/bookings/${token}/contract/sign`, request);
}

export function fetchContractPdf(token: string): Promise<Blob> {
  return apiGetBlob(`/api/bookings/${token}/contract/pdf`);
}

/**
 * How a session type is named to a human, everywhere outside the catalog cards: the group
 * carries half the meaning ("Bàsica editada" alone says nothing). Mirrors the API's
 * SessionTypeInfo.DisplayName, used where the API sends the two parts separately.
 */
export const sessionDisplayName = (groupName: string, typeName: string) => `${groupName} ${typeName}`;
