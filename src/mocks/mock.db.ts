import type { AdminBooking, BlockedPeriod, WeeklyAvailability } from '../services/booking/booking.admin.api';
import type { ImageRightsConsent, SessionType } from '../services/booking/booking.api';
import type { SessionGroup } from '../services/booking/booking.admin.api';
import { sessionGroupFixtures, sessionTypeFixtures } from './fixtures/session.fixtures';
import { invitationFixtures, weddingFixtures } from './fixtures/wedding.fixtures';
import type { MockInvitation, MockWedding } from './fixtures/wedding.fixtures';
import { addDays, isoOffset, isoUtc, newToken, studioLocalToUtc, studioToday, type Weekday } from './mock.utils';

/** The agenda half of a session type (API spec 008). No row means "not reservable". */
export interface MockBookingSession {
  sessionTypeId: number;
  bufferMinutes: number;
  bookableFrom: string | null;
  bookableTo: string | null;
}

/** What POST /contract/sign persists. Immutable once written: signing is one-shot. */
export interface MockContract {
  bookingId: number;
  signedAtUtc: string;
  imageRights: ImageRightsConsent;
  signatureImageDataUrl: string;
}

const WEEKDAY_NAMES: Weekday[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Weekly ranges from the API's dev seed (Modules/Booking/Data/Seed/dev_availability.sql):
 * a wide studio grid for everything, except the "Exterior" types, which only shoot on
 * Tuesday mornings for the natural light.
 */
const STUDIO_GRID: [number, string, string][] = [
  [1, '10:00:00', '14:00:00'],
  [1, '16:00:00', '19:00:00'],
  [2, '10:00:00', '14:00:00'],
  [2, '16:00:00', '19:00:00'],
  [3, '10:00:00', '14:00:00'],
  [4, '10:00:00', '14:00:00'],
  [4, '16:00:00', '19:00:00'],
  [5, '10:00:00', '14:00:00'],
  [6, '10:00:00', '13:00:00'],
];

const OUTDOOR_GRID: [number, string, string][] = [[2, '10:00:00', '12:00:00']];

function seedWeeklyAvailability(): WeeklyAvailability[] {
  let id = 0;
  return sessionTypeFixtures.flatMap(type => {
    const grid = type.name.startsWith('Exterior') ? OUTDOOR_GRID : STUDIO_GRID;
    return grid.map(([weekday, startTime, endTime]) => ({
      id: ++id,
      sessionTypeId: type.id,
      weekday: WEEKDAY_NAMES[weekday],
      startTime,
      endTime,
    }));
  });
}

function seedBlockedPeriods(): BlockedPeriod[] {
  const today = studioToday();
  return [
    { id: 1, from: addDays(today, 3), to: addDays(today, 3), reason: 'Dia bloquejat de prova' },
    { id: 2, from: addDays(today, 7), to: addDays(today, 10), reason: 'Vacances de prova' },
  ];
}

/** Two bookings on the next open studio morning, so the admin panel is not empty. */
function seedBookings(): AdminBooking[] {
  const today = studioToday();
  const start = studioLocalToUtc(addDays(today, 14), 10 * 60);
  const createdAt = isoUtc(new Date());

  return [
    {
      id: 1,
      sessionTypeId: 1,
      startAt: isoOffset(start),
      endAt: isoOffset(new Date(start.getTime() + 90 * 60_000)),
      status: 'Requested',
      clientName: 'Jane Doe',
      clientEmail: 'jane@example.com',
      clientPhone: '+34600000000',
      dni: '12345678Z',
      address: 'C/ Major 1, 08001 Barcelona',
      imageRights: 'GrantAll',
      notes: 'Outdoor portrait',
      confirmationToken: 'A1B2C3D4E5F60718293A4B5C6D7E8F90',
      contractSignedAt: null,
      createdAt,
      updatedAt: createdAt,
      participants: [
        { id: 1, name: 'Jane Doe', age: null },
        { id: 2, name: 'Pol', age: 7 },
      ],
    },
    {
      id: 2,
      sessionTypeId: 7,
      startAt: isoOffset(studioLocalToUtc(addDays(today, 21), 16 * 60)),
      endAt: isoOffset(new Date(studioLocalToUtc(addDays(today, 21), 16 * 60).getTime() + 45 * 60_000)),
      status: 'Confirmed',
      clientName: 'Maria Garcia',
      clientEmail: 'maria@example.com',
      clientPhone: '600 123 456',
      dni: '87654321X',
      address: 'Av. Diagonal 200, 08018 Barcelona',
      imageRights: 'GrantMineDenyMinors',
      notes: null,
      confirmationToken: newToken(),
      contractSignedAt: null,
      createdAt,
      updatedAt: createdAt,
      participants: [{ id: 3, name: 'Maria Garcia', age: null }],
    },
  ];
}

/**
 * Everything the handlers read and write. Module-level, so writes survive across requests for
 * the life of the tab — a booking you create is a booking you can then open and sign.
 */
export const db = {
  sessionGroups: structuredClone(sessionGroupFixtures) as SessionGroup[],
  sessionTypes: structuredClone(sessionTypeFixtures) as SessionType[],
  // Every seeded type is on the agenda with no buffer and no season window (002_booking_sessions.sql).
  bookingSessions: sessionTypeFixtures.map<MockBookingSession>(type => ({
    sessionTypeId: type.id,
    bufferMinutes: 0,
    bookableFrom: null,
    bookableTo: null,
  })),
  weeklyAvailabilities: seedWeeklyAvailability(),
  blockedPeriods: seedBlockedPeriods(),
  bookings: seedBookings(),
  contracts: [] as MockContract[],
  weddings: structuredClone(weddingFixtures) as MockWedding[],
  invitations: structuredClone(invitationFixtures) as MockInvitation[],
};

const sequences = {
  sessionGroup: Math.max(...db.sessionGroups.map(g => g.id)),
  sessionType: Math.max(...db.sessionTypes.map(t => t.id)),
  weeklyAvailability: Math.max(...db.weeklyAvailabilities.map(a => a.id)),
  blockedPeriod: Math.max(...db.blockedPeriods.map(p => p.id)),
  booking: Math.max(...db.bookings.map(b => b.id)),
  participant: 3,
  wedding: Math.max(...db.weddings.map(w => w.id)),
  invitation: Math.max(...db.invitations.map(i => i.id)),
  guest: Math.max(...db.invitations.flatMap(i => i.guests.map(g => g.id))),
};

export const nextId = (sequence: keyof typeof sequences) => ++sequences[sequence];

/** "{group} {type}", the API's SessionTypeInfo.DisplayName. */
export function displayName(sessionTypeId: number): string {
  const type = db.sessionTypes.find(t => t.id === sessionTypeId);
  if (!type) return `Sessió ${sessionTypeId}`;
  const group = db.sessionGroups.find(g => g.id === type.sessionGroupId);
  return group ? `${group.name} ${type.name}` : type.name;
}
