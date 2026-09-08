import type { ErrorCode } from '../services/error-messages';
import type { AvailabilityDay, AvailabilityResponse, AvailabilitySlot } from '../services/booking/booking.api';
import { db, type MockBookingSession } from './mock.db';
import {
  BOOKING_CONFIG,
  addDays,
  daysBetween,
  isoOffset,
  studioLocalToUtc,
  studioToday,
  timeToMinutes,
  weekdayOf,
} from './mock.utils';

/**
 * A port of the API's AvailabilityCalculator. Kept faithful on the parts the UI can see:
 * every day in the range comes back (empty `slots` when nothing is free), slots step by
 * SlotIntervalMinutes, and `endAt` excludes the buffer — the buffer only blocks neighbours.
 */

/** Last date a client may book, inclusive. The frontend caps its calendar here. */
export const bookableUntil = () => addDays(studioToday(), BOOKING_CONFIG.bookingHorizonDays);

const isBlocked = (date: string) => db.blockedPeriods.some(period => date >= period.from && date <= period.to);

const isInSeason = (date: string, session: MockBookingSession) =>
  (session.bookableFrom === null || date >= session.bookableFrom) &&
  (session.bookableTo === null || date <= session.bookableTo);

/** [start, end) of every slot already taken, buffers included. */
function occupiedIntervals(): { start: number; end: number }[] {
  return db.bookings
    .filter(booking => booking.status !== 'Cancelled')
    .map(booking => {
      const session = db.bookingSessions.find(s => s.sessionTypeId === booking.sessionTypeId);
      return {
        start: Date.parse(booking.startAt),
        end: Date.parse(booking.endAt) + (session?.bufferMinutes ?? 0) * 60_000,
      };
    });
}

function slotsForDate(date: string, durationMinutes: number, session: MockBookingSession): AvailabilitySlot[] {
  if (isBlocked(date) || !isInSeason(date, session) || date > bookableUntil()) return [];

  const weekday = weekdayOf(date);
  const ranges = db.weeklyAvailabilities.filter(
    range => range.sessionTypeId === session.sessionTypeId && range.weekday === weekday,
  );

  const now = Date.now();
  const occupied = occupiedIntervals();
  const durationMs = durationMinutes * 60_000;
  const bufferMs = session.bufferMinutes * 60_000;
  const slots: AvailabilitySlot[] = [];

  for (const range of ranges) {
    const rangeEnd = studioLocalToUtc(date, timeToMinutes(range.endTime)).getTime();

    for (
      let minutes = timeToMinutes(range.startTime);
      ;
      minutes += BOOKING_CONFIG.slotIntervalMinutes
    ) {
      const start = studioLocalToUtc(date, minutes).getTime();
      if (start + durationMs > rangeEnd) break;
      if (start < now) continue;

      const collides = occupied.some(taken => start < taken.end && start + durationMs + bufferMs > taken.start);
      if (collides) continue;

      slots.push({ startAt: isoOffset(new Date(start)), endAt: isoOffset(new Date(start + durationMs)) });
    }
  }

  return slots.sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function buildAvailability(sessionTypeId: number, from: string, to: string): AvailabilityResponse {
  const type = db.sessionTypes.find(t => t.id === sessionTypeId)!;
  const session = db.bookingSessions.find(s => s.sessionTypeId === sessionTypeId)!;

  const days: AvailabilityDay[] = [];
  for (let offset = 0; offset <= daysBetween(from, to); offset++) {
    const date = addDays(from, offset);
    days.push({ date, slots: slotsForDate(date, type.durationMinutes, session) });
  }

  return {
    sessionTypeId,
    durationMinutes: type.durationMinutes,
    timezone: BOOKING_CONFIG.studioTimeZone,
    bookableUntil: bookableUntil(),
    days,
  };
}

/**
 * The POST /api/bookings re-check. Returns the specific SLOT_* code the API would emit, or
 * null when the slot is good. Every SLOT_* here is a 422 except SLOT_TAKEN, which is 409.
 */
export function validateSlot(sessionTypeId: number, startAt: string): ErrorCode | null {
  const type = db.sessionTypes.find(t => t.id === sessionTypeId);
  const session = db.bookingSessions.find(s => s.sessionTypeId === sessionTypeId);
  if (!type) return 'SESSION_TYPE_NOT_FOUND';
  if (!session) return 'SESSION_TYPE_NOT_BOOKABLE';

  const start = Date.parse(startAt);
  if (Number.isNaN(start)) return 'VALIDATION_ERROR';
  if (start < Date.now()) return 'SLOT_IN_PAST';

  const date = new Date(start).toISOString().slice(0, 10);
  if (date > bookableUntil()) return 'SLOT_BEYOND_HORIZON';
  if (!isInSeason(date, session)) return 'SLOT_OUT_OF_SEASON_WINDOW';
  if (isBlocked(date)) return 'SLOT_BLOCKED';

  const durationMs = type.durationMinutes * 60_000;
  const bufferMs = session.bufferMinutes * 60_000;

  const insideARange = db.weeklyAvailabilities
    .filter(range => range.sessionTypeId === sessionTypeId && range.weekday === weekdayOf(date))
    .some(range => {
      const rangeStart = studioLocalToUtc(date, timeToMinutes(range.startTime)).getTime();
      const rangeEnd = studioLocalToUtc(date, timeToMinutes(range.endTime)).getTime();
      const alignedToGrid = (start - rangeStart) % (BOOKING_CONFIG.slotIntervalMinutes * 60_000) === 0;
      return start >= rangeStart && start + durationMs <= rangeEnd && alignedToGrid;
    });
  if (!insideARange) return 'SLOT_OUTSIDE_WEEKLY_AVAILABILITY';

  const taken = occupiedIntervals().some(
    interval => start < interval.end && start + durationMs + bufferMs > interval.start,
  );
  return taken ? 'SLOT_TAKEN' : null;
}
