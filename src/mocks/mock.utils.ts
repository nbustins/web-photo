import { HttpResponse } from 'msw';
import type { ErrorCode } from '../services/error-messages';

/** Base URL the app builds its requests with. MSW matches absolute URLs, so handlers need it. */
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const api = (path: string) => `${BASE}${path}`;

/** Mirrors appsettings.json "Booking" so the mock behaves like the real availability engine. */
export const BOOKING_CONFIG = {
  slotIntervalMinutes: 30,
  studioTimeZone: 'Europe/Madrid',
  bookingHorizonDays: 60,
  maxAvailabilityQueryDays: 90,
  depositPercent: 10,
} as const;

/** Artificial latency so loading states are visible while designing. */
export const delay = (ms = 250) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * RFC 9457 body with the API's two extension members (spec 011). `errorCode` is what
 * errorMessage() in src/services/error-messages.ts keys the Catalan copy on.
 */
export function problem(status: number, errorCode: ErrorCode, detail: string) {
  return HttpResponse.json(
    {
      type: `https://tools.ietf.org/html/rfc9110#section-15.5.${status === 404 ? '5' : '10'}`,
      title: detail,
      status,
      detail,
      errorCode,
      traceId: `00-${crypto.randomUUID().replace(/-/g, '')}-mock-01`,
    },
    { status },
  );
}

/** The framework's auto-400 shape, plus the same extensions. */
export function validationProblem(errors: Record<string, string[]>) {
  return HttpResponse.json(
    {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
      errors,
      errorCode: 'VALIDATION_ERROR',
      traceId: `00-${crypto.randomUUID().replace(/-/g, '')}-mock-01`,
    },
    { status: 400 },
  );
}

// --- Dates -------------------------------------------------------------------
//
// The API emits two different shapes for the same instant, and the app parses both:
//   DateTimeOffset (startAt/endAt) -> "2026-05-15T09:00:00+00:00"
//   DateTime       (createdAt, …)  -> "2026-05-15T09:00:00.000Z"
// Keep them apart or date handling in the UI silently drifts from production.

/** DateTimeOffset on the wire: built with TimeSpan.Zero, so "+00:00" and never "Z". */
export const isoOffset = (date: Date) => `${date.toISOString().slice(0, 19)}+00:00`;

/** DateTime on the wire: UTC kind, so a "Z" suffix. */
export const isoUtc = (date: Date) => date.toISOString();

/** DateOnly on the wire. */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

function tzOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return (asUtc - instant.getTime() + instant.getMilliseconds()) / 60_000;
}

/** Studio wall clock -> UTC instant. Two passes so DST boundaries land on the right offset. */
export function studioLocalToUtc(dateOnly: string, minutesFromMidnight: number): Date {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const naive = Date.UTC(year, month - 1, day) + minutesFromMidnight * 60_000;
  const firstGuess = naive - tzOffsetMinutes(new Date(naive), BOOKING_CONFIG.studioTimeZone) * 60_000;
  const offset = tzOffsetMinutes(new Date(firstGuess), BOOKING_CONFIG.studioTimeZone);
  return new Date(naive - offset * 60_000);
}

/** Today's date in the studio's timezone, not the browser's. */
export function studioToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING_CONFIG.studioTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function addDays(dateOnly: string, days: number): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return isoDate(new Date(Date.UTC(year, month - 1, day + days)));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export function weekdayOf(dateOnly: string): Weekday {
  return WEEKDAYS[new Date(`${dateOnly}T00:00:00Z`).getUTCDay()];
}

/** 'HH:mm:ss' -> minutes from midnight. */
export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** ca-ES currency, the format the API's contract fields already come rendered in. */
export const euros = (amount: number) =>
  new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(amount);

/** Confirmation tokens are 16 random bytes as uppercase hex. */
export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
