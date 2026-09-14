import { http, HttpResponse } from 'msw';
import type {
  BlockedPeriod,
  BookingSession,
  BookingSessionPayload,
  BookingStatus,
  SessionGroup,
  SessionTypePayload,
  WeeklyAvailability,
  WeeklyAvailabilityPayload,
} from '../../services/booking/booking.admin.api';
import type { SessionType } from '../../services/booking/booking.api';
import { pdfResponse } from '../fixtures/contract.fixtures';
import { db, displayName, nextId } from '../mock.db';
import { api, delay, isoUtc, problem, timeToMinutes } from '../mock.utils';

/** The API's state machine. Everything not listed is a 409, and a no-op repeat is a success. */
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  Requested: ['Confirmed', 'Cancelled'],
  Confirmed: ['Paid', 'Cancelled'],
  Paid: ['Cancelled'],
  Cancelled: [],
};

const toBookingSession = (sessionTypeId: number): BookingSession => {
  const session = db.bookingSessions.find(s => s.sessionTypeId === sessionTypeId);
  return {
    sessionTypeId,
    sessionTypeName: displayName(sessionTypeId),
    bufferMinutes: session?.bufferMinutes ?? 0,
    bookableFrom: session?.bookableFrom ?? null,
    bookableTo: session?.bookableTo ?? null,
    onAgenda: Boolean(session),
  };
};

export const bookingAdminHandlers = [
  // --- Bookings ------------------------------------------------------------

  http.get(api('/api/admin/bookings'), async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const bookings = db.bookings
      .filter(booking => !status || booking.status === status)
      .filter(booking => !from || booking.startAt.slice(0, 10) >= from)
      .filter(booking => !to || booking.startAt.slice(0, 10) <= to)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));

    return HttpResponse.json(bookings);
  }),

  http.patch(api('/api/admin/bookings/:id'), async ({ params, request }) => {
    await delay(300);
    const booking = db.bookings.find(b => b.id === Number(params.id));
    if (!booking) return problem(404, 'BOOKING_NOT_FOUND', "No s'ha trobat la reserva.");

    const { status } = (await request.json()) as { status: BookingStatus };
    if (status !== booking.status && !ALLOWED_TRANSITIONS[booking.status].includes(status)) {
      return problem(409, 'BOOKING_STATUS_TRANSITION_INVALID', 'Aquest canvi d’estat no és possible.');
    }

    booking.status = status;
    booking.updatedAt = isoUtc(new Date());
    return HttpResponse.json(booking);
  }),

  http.get(api('/api/admin/bookings/:id/contract/pdf'), async ({ params }) => {
    await delay(400);
    const booking = db.bookings.find(b => b.id === Number(params.id));
    if (!booking) return problem(404, 'BOOKING_NOT_FOUND', "No s'ha trobat la reserva.");
    if (!db.contracts.some(contract => contract.bookingId === booking.id)) {
      return problem(404, 'CONTRACT_NOT_FOUND', "No s'ha trobat el contracte signat.");
    }
    return pdfResponse(`contracte-${booking.id}.pdf`);
  }),

  http.post(api('/api/admin/bookings/:id/emails/:kind'), async ({ params }) => {
    await delay(500);
    const booking = db.bookings.find(b => b.id === Number(params.id));
    if (!booking) return problem(404, 'BOOKING_NOT_FOUND', "No s'ha trobat la reserva.");
    return HttpResponse.json({ delivered: true });
  }),

  // --- Session groups ------------------------------------------------------

  http.get(api('/api/admin/session-groups'), async () => {
    await delay(200);
    return HttpResponse.json<SessionGroup[]>(db.sessionGroups);
  }),

  http.post(api('/api/admin/session-groups'), async ({ request }) => {
    await delay(300);
    const { name } = (await request.json()) as { name: string };
    const group: SessionGroup = { id: nextId('sessionGroup'), name };
    db.sessionGroups.push(group);
    return HttpResponse.json(group, { status: 201 });
  }),

  http.put(api('/api/admin/session-groups/:id'), async ({ params, request }) => {
    await delay(300);
    const group = db.sessionGroups.find(g => g.id === Number(params.id));
    if (!group) return problem(404, 'SESSION_GROUP_NOT_FOUND', "No s'ha trobat el grup de sessions.");
    const { name } = (await request.json()) as { name: string };
    group.name = name;
    return HttpResponse.json(group);
  }),

  http.delete(api('/api/admin/session-groups/:id'), async ({ params }) => {
    await delay(300);
    const id = Number(params.id);
    const index = db.sessionGroups.findIndex(group => group.id === id);
    if (index < 0) return problem(404, 'SESSION_GROUP_NOT_FOUND', "No s'ha trobat el grup de sessions.");
    if (db.sessionTypes.some(type => type.sessionGroupId === id)) {
      return problem(409, 'SESSION_GROUP_IN_USE', 'El grup té tipus de sessió associats i no es pot eliminar.');
    }
    db.sessionGroups.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- Session types -------------------------------------------------------

  http.get(api('/api/admin/session-types'), async () => {
    await delay(250);
    return HttpResponse.json<SessionType[]>(db.sessionTypes);
  }),

  http.post(api('/api/admin/session-types'), async ({ request }) => {
    await delay(300);
    const payload = (await request.json()) as SessionTypePayload;
    const invalid = validateSessionTypePayload(payload);
    if (invalid) return invalid;

    const type: SessionType = { id: nextId('sessionType'), ...payload, adviceText: payload.adviceText ?? null };
    db.sessionTypes.push(type);
    return HttpResponse.json(type, { status: 201 });
  }),

  http.put(api('/api/admin/session-types/:id'), async ({ params, request }) => {
    await delay(300);
    const type = db.sessionTypes.find(t => t.id === Number(params.id));
    if (!type) return problem(404, 'SESSION_TYPE_NOT_FOUND', "No s'ha trobat el tipus de sessió.");

    const payload = (await request.json()) as SessionTypePayload;
    const invalid = validateSessionTypePayload(payload);
    if (invalid) return invalid;

    Object.assign(type, payload, { adviceText: payload.adviceText ?? null });
    return HttpResponse.json(type);
  }),

  /** Soft delete, like the API: the type stays for historical bookings but leaves the catalog. */
  http.delete(api('/api/admin/session-types/:id'), async ({ params }) => {
    await delay(300);
    const type = db.sessionTypes.find(t => t.id === Number(params.id));
    if (!type) return problem(404, 'SESSION_TYPE_NOT_FOUND', "No s'ha trobat el tipus de sessió.");
    type.isActive = false;
    return new HttpResponse(null, { status: 204 });
  }),

  // --- Booking sessions (agenda) -------------------------------------------

  http.get(api('/api/admin/booking-sessions'), async () => {
    await delay(250);
    const sessions = db.sessionTypes
      .map(type => toBookingSession(type.id))
      .sort((a, b) => a.sessionTypeId - b.sessionTypeId);
    return HttpResponse.json<BookingSession[]>(sessions);
  }),

  http.put(api('/api/admin/booking-sessions/:sessionTypeId'), async ({ params, request }) => {
    await delay(300);
    const sessionTypeId = Number(params.sessionTypeId);
    if (!db.sessionTypes.some(type => type.id === sessionTypeId)) {
      return problem(404, 'SESSION_TYPE_NOT_FOUND', "No s'ha trobat el tipus de sessió.");
    }

    const payload = (await request.json()) as BookingSessionPayload;
    if (payload.bookableFrom && payload.bookableTo && payload.bookableFrom > payload.bookableTo) {
      return problem(400, 'DATE_RANGE_INVALID', "El rang de dates no és vàlid.");
    }

    const existing = db.bookingSessions.find(session => session.sessionTypeId === sessionTypeId);
    const next = {
      sessionTypeId,
      bufferMinutes: payload.bufferMinutes,
      bookableFrom: payload.bookableFrom ?? null,
      bookableTo: payload.bookableTo ?? null,
    };
    if (existing) Object.assign(existing, next);
    else db.bookingSessions.push(next);

    return HttpResponse.json(toBookingSession(sessionTypeId));
  }),

  // --- Weekly availability -------------------------------------------------

  http.get(api('/api/admin/availability'), async ({ request }) => {
    await delay(250);
    const sessionTypeId = Number(new URL(request.url).searchParams.get('sessionTypeId')) || null;
    const ranges = db.weeklyAvailabilities
      .filter(range => !sessionTypeId || range.sessionTypeId === sessionTypeId)
      .sort(
        (a, b) =>
          a.sessionTypeId - b.sessionTypeId ||
          WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday) ||
          a.startTime.localeCompare(b.startTime),
      );
    return HttpResponse.json<WeeklyAvailability[]>(ranges);
  }),

  http.post(api('/api/admin/availability'), async ({ request }) => {
    await delay(300);
    const payload = (await request.json()) as WeeklyAvailabilityPayload;
    const invalid = validateRangePayload(payload);
    if (invalid) return invalid;

    const range: WeeklyAvailability = { id: nextId('weeklyAvailability'), ...payload };
    db.weeklyAvailabilities.push(range);
    return HttpResponse.json(range, { status: 201 });
  }),

  http.put(api('/api/admin/availability/:id'), async ({ params, request }) => {
    await delay(300);
    const range = db.weeklyAvailabilities.find(r => r.id === Number(params.id));
    if (!range) return problem(404, 'AVAILABILITY_NOT_FOUND', "No s'ha trobat la franja horària.");

    const payload = (await request.json()) as WeeklyAvailabilityPayload;
    const invalid = validateRangePayload(payload);
    if (invalid) return invalid;

    Object.assign(range, payload);
    return HttpResponse.json(range);
  }),

  http.delete(api('/api/admin/availability/:id'), async ({ params }) => {
    await delay(300);
    const index = db.weeklyAvailabilities.findIndex(range => range.id === Number(params.id));
    if (index < 0) return problem(404, 'AVAILABILITY_NOT_FOUND', "No s'ha trobat la franja horària.");
    db.weeklyAvailabilities.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- Blocked periods -----------------------------------------------------

  http.get(api('/api/admin/blocked-periods'), async () => {
    await delay(250);
    const periods = [...db.blockedPeriods].sort((a, b) => a.from.localeCompare(b.from));
    return HttpResponse.json<BlockedPeriod[]>(periods);
  }),

  http.post(api('/api/admin/blocked-periods'), async ({ request }) => {
    await delay(300);
    const payload = (await request.json()) as { from: string; to: string; reason?: string };
    if (payload.from > payload.to) {
      return problem(400, 'DATE_RANGE_INVALID', "El rang de dates no és vàlid.");
    }
    const period: BlockedPeriod = {
      id: nextId('blockedPeriod'),
      from: payload.from,
      to: payload.to,
      reason: payload.reason ?? null,
    };
    db.blockedPeriods.push(period);
    return HttpResponse.json(period, { status: 201 });
  }),

  http.delete(api('/api/admin/blocked-periods/:id'), async ({ params }) => {
    await delay(300);
    const index = db.blockedPeriods.findIndex(period => period.id === Number(params.id));
    if (index < 0) return problem(404, 'BLOCKED_PERIOD_NOT_FOUND', "No s'ha trobat el període bloquejat.");
    db.blockedPeriods.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

const WEEKDAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function validateSessionTypePayload(payload: SessionTypePayload) {
  if (!db.sessionGroups.some(group => group.id === payload.sessionGroupId)) {
    return problem(404, 'SESSION_GROUP_NOT_FOUND', "No s'ha trobat el grup de sessions.");
  }
  if (Math.round(payload.price * 100) !== payload.price * 100) {
    return problem(400, 'PRICE_TOO_MANY_DECIMALS', 'El preu no pot tenir més de 2 decimals.');
  }
  return null;
}

function validateRangePayload(payload: WeeklyAvailabilityPayload) {
  if (!db.sessionTypes.some(type => type.id === payload.sessionTypeId)) {
    return problem(404, 'SESSION_TYPE_NOT_FOUND', "No s'ha trobat el tipus de sessió.");
  }
  if (!db.bookingSessions.some(session => session.sessionTypeId === payload.sessionTypeId)) {
    return problem(400, 'SESSION_TYPE_NOT_BOOKABLE', "Aquest tipus de sessió no és reservable.");
  }
  if (timeToMinutes(payload.startTime) >= timeToMinutes(payload.endTime)) {
    return problem(400, 'TIME_RANGE_INVALID', "L'hora d'inici ha de ser anterior a la de fi.");
  }
  return null;
}
