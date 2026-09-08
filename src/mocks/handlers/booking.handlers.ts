import { http, HttpResponse } from 'msw';
import type {
  BookableSessionGroup,
  BookingByToken,
  BookingContract,
  CreateBookingRequest,
  CreateBookingResult,
  SessionGroupWithTypes,
  SessionType,
  SignContractRequest,
} from '../../services/booking/booking.api';
import type { AdminBooking } from '../../services/booking/booking.admin.api';
import { buildAvailability, validateSlot } from '../availability.mock';
import {
  CHECK_AUTHORIZATION,
  CONTRACT_TEMPLATE_VERSION,
  pdfResponse,
  renderContractSections,
} from '../fixtures/contract.fixtures';
import { db, displayName, nextId } from '../mock.db';
import {
  BOOKING_CONFIG,
  api,
  daysBetween,
  delay,
  euros,
  isoOffset,
  isoUtc,
  newToken,
  problem,
  validationProblem,
} from '../mock.utils';

const activeTypes = () => db.sessionTypes.filter(type => type.isActive);


function contractFor(booking: AdminBooking): BookingContract {
  const signed = db.contracts.find(contract => contract.bookingId === booking.id);
  const imageRights = signed?.imageRights ?? booking.imageRights;
  const type = db.sessionTypes.find(t => t.id === booking.sessionTypeId);
  const price = type?.price ?? 0;
  const prepaid = Math.round(price * BOOKING_CONFIG.depositPercent) / 100;

  const fields = {
    clientName: booking.clientName,
    clientDocumentNumber: booking.dni,
    clientAddress: booking.address,
    // The API renders a missing email as an em dash rather than an empty field.
    clientEmail: booking.clientEmail || '—',
    clientPhone: booking.clientPhone,
    packName: displayName(booking.sessionTypeId),
    packPayPrepaid: euros(prepaid),
    packPayPending: euros(price - prepaid),
    checkAuthorization: CHECK_AUTHORIZATION[imageRights],
  };

  return {
    signed: Boolean(signed),
    signedAtUtc: signed?.signedAtUtc ?? null,
    templateVersion: CONTRACT_TEMPLATE_VERSION,
    imageRights,
    signatureImageDataUrl: signed?.signatureImageDataUrl ?? null,
    fields,
    sections: renderContractSections({
      client_name: fields.clientName,
      client_document_number: fields.clientDocumentNumber,
      client_address: fields.clientAddress,
      client_email: fields.clientEmail,
      client_phone: fields.clientPhone,
      pack_name: fields.packName,
      pack_pay_prepaid: fields.packPayPrepaid,
      pack_pay_pending: fields.packPayPending,
      check_authorization: fields.checkAuthorization,
    }),
  };
}

export const bookingHandlers = [
  // --- Catalog -------------------------------------------------------------

  http.get(api('/api/session-groups'), async () => {
    await delay(200);
    const groups = db.sessionGroups
      .map<SessionGroupWithTypes>(group => ({
        id: group.id,
        name: group.name,
        sessionTypes: activeTypes().filter(type => type.sessionGroupId === group.id),
      }))
      .filter(group => group.sessionTypes.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    return HttpResponse.json(groups);
  }),

  http.get(api('/api/session-groups/:sessionGroupId/session-types'), async ({ params }) => {
    await delay(200);
    const groupId = Number(params.sessionGroupId);
    if (!db.sessionGroups.some(group => group.id === groupId)) {
      return problem(404, 'SESSION_GROUP_NOT_FOUND', "No s'ha trobat el grup de sessions.");
    }
    return HttpResponse.json<SessionType[]>(activeTypes().filter(type => type.sessionGroupId === groupId));
  }),

  /** Booking flow only: published *and* on the agenda (API spec 008 QS5). */
  http.get(api('/api/booking/session-groups'), async () => {
    await delay(250);
    const bookable = activeTypes().filter(type =>
      db.bookingSessions.some(session => session.sessionTypeId === type.id),
    );
    const groups = db.sessionGroups
      .map<BookableSessionGroup>(group => ({
        id: group.id,
        name: group.name,
        sessionTypes: bookable
          .filter(type => type.sessionGroupId === group.id)
          .map(({ id, sessionGroupId, name, durationMinutes }) => ({ id, sessionGroupId, name, durationMinutes })),
      }))
      .filter(group => group.sessionTypes.length > 0);
    return HttpResponse.json(groups);
  }),

  // --- Availability --------------------------------------------------------

  http.get(api('/api/bookings/availability'), async ({ request }) => {
    await delay(350);
    const url = new URL(request.url);
    const sessionTypeId = Number(url.searchParams.get('sessionTypeId'));
    const from = url.searchParams.get('from') ?? '';
    const to = url.searchParams.get('to') ?? '';

    const type = db.sessionTypes.find(t => t.id === sessionTypeId && t.isActive);
    const session = db.bookingSessions.find(s => s.sessionTypeId === sessionTypeId);
    if (!type || !session) {
      return problem(404, 'SESSION_TYPE_NOT_FOUND', "No s'ha trobat el tipus de sessió.");
    }

    const span = daysBetween(from, to);
    if (span < 0) return problem(422, 'DATE_RANGE_INVALID', "El rang de dates no és vàlid.");
    if (span > BOOKING_CONFIG.maxAvailabilityQueryDays) {
      return problem(422, 'DATE_RANGE_TOO_LONG', 'El rang de dates és massa llarg.');
    }

    return HttpResponse.json(buildAvailability(sessionTypeId, from, to));
  }),

  // --- Bookings ------------------------------------------------------------

  http.post(api('/api/bookings'), async ({ request }) => {
    await delay(450);
    const body = (await request.json()) as CreateBookingRequest;

    if (!body.participants?.length) {
      return validationProblem({ Participants: ['Cal almenys un participant.'] });
    }

    const slotError = validateSlot(body.sessionTypeId, body.startAt);
    if (slotError === 'SESSION_TYPE_NOT_FOUND' || slotError === 'SESSION_TYPE_NOT_BOOKABLE') {
      return problem(404, slotError, "No s'ha trobat el tipus de sessió.");
    }
    if (slotError === 'SLOT_TAKEN') {
      return problem(409, slotError, 'Aquesta hora acaba de ser reservada.');
    }
    if (slotError) {
      return problem(422, slotError, "Aquesta hora ja no es pot reservar.");
    }

    const type = db.sessionTypes.find(t => t.id === body.sessionTypeId)!;
    const start = new Date(body.startAt);
    const now = isoUtc(new Date());
    const booking: AdminBooking = {
      id: nextId('booking'),
      sessionTypeId: body.sessionTypeId,
      startAt: isoOffset(start),
      endAt: isoOffset(new Date(start.getTime() + type.durationMinutes * 60_000)),
      status: 'Requested',
      // The request nests these under `reserver`; the response flattens them. Mirrors the API.
      clientName: body.reserver.name,
      clientEmail: body.reserver.email,
      clientPhone: body.reserver.phone,
      dni: body.reserver.dni.toUpperCase(),
      address: body.reserver.address,
      imageRights: body.imageRights,
      notes: body.notes ?? null,
      confirmationToken: newToken(),
      contractSignedAt: null,
      createdAt: now,
      updatedAt: now,
      participants: body.participants.map(participant => ({
        id: nextId('participant'),
        name: participant.name,
        age: participant.age ?? null,
      })),
    };
    db.bookings.push(booking);

    return HttpResponse.json<CreateBookingResult>(
      { id: booking.id, confirmationToken: booking.confirmationToken },
      { status: 201, headers: { Location: `/api/bookings/${booking.confirmationToken}` } },
    );
  }),

  http.get(api('/api/bookings/:token'), async ({ params }) => {
    await delay(250);
    const booking = db.bookings.find(b => b.confirmationToken === params.token);
    if (!booking) return problem(404, 'BOOKING_NOT_FOUND', "No s'ha trobat la reserva.");

    const { id, sessionTypeId, startAt, endAt, status, clientName, imageRights, confirmationToken, contractSignedAt } =
      booking;
    return HttpResponse.json<BookingByToken>({
      id,
      sessionTypeId,
      startAt,
      endAt,
      status,
      clientName,
      imageRights,
      confirmationToken,
      contractSignedAt,
    });
  }),

  http.delete(api('/api/bookings/:token'), async ({ params }) => {
    await delay(300);
    const booking = db.bookings.find(b => b.confirmationToken === params.token);
    if (!booking) return problem(404, 'BOOKING_NOT_FOUND', "No s'ha trobat la reserva.");
    if (booking.status !== 'Requested') {
      return problem(409, 'BOOKING_NOT_CANCELLABLE', 'La reserva ja no es pot cancel·lar.');
    }
    booking.status = 'Cancelled';
    booking.updatedAt = isoUtc(new Date());
    return new HttpResponse(null, { status: 204 });
  }),

  // --- Contract ------------------------------------------------------------

  http.get(api('/api/bookings/:token/contract'), async ({ params }) => {
    await delay(300);
    const booking = db.bookings.find(b => b.confirmationToken === params.token);
    if (!booking) return problem(404, 'BOOKING_NOT_FOUND', "No s'ha trobat la reserva.");
    return HttpResponse.json(contractFor(booking));
  }),

  http.post(api('/api/bookings/:token/contract/sign'), async ({ params, request }) => {
    await delay(500);
    const booking = db.bookings.find(b => b.confirmationToken === params.token);
    if (!booking) return problem(404, 'BOOKING_NOT_FOUND', "No s'ha trobat la reserva.");
    if (booking.status === 'Cancelled') {
      return problem(409, 'BOOKING_CANCELLED', 'La reserva està cancel·lada.');
    }
    if (db.contracts.some(contract => contract.bookingId === booking.id)) {
      return problem(409, 'CONTRACT_ALREADY_SIGNED', 'El contracte ja està signat.');
    }

    const body = (await request.json()) as SignContractRequest;
    const base64 = body.signatureImagePngBase64.includes(',')
      ? body.signatureImagePngBase64.slice(body.signatureImagePngBase64.indexOf(',') + 1)
      : body.signatureImagePngBase64;

    let bytes: Uint8Array;
    try {
      bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    } catch {
      return problem(400, 'SIGNATURE_INVALID_IMAGE', "La signatura no és una imatge vàlida.");
    }
    if (bytes.length > 200 * 1024) {
      return problem(400, 'SIGNATURE_TOO_LARGE', 'La signatura és massa gran.');
    }
    const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (PNG_MAGIC.some((byte, index) => bytes[index] !== byte)) {
      return problem(400, 'SIGNATURE_NOT_PNG', 'La signatura ha de ser un PNG.');
    }

    const signedAtUtc = isoUtc(new Date());
    db.contracts.push({
      bookingId: booking.id,
      signedAtUtc,
      imageRights: body.imageRights,
      signatureImageDataUrl: `data:image/png;base64,${base64}`,
    });
    // Signing overwrites the consent captured at booking time.
    booking.imageRights = body.imageRights;
    booking.contractSignedAt = signedAtUtc;
    booking.updatedAt = signedAtUtc;

    return new HttpResponse(null, { status: 204 });
  }),

  http.get(api('/api/bookings/:token/contract/pdf'), async ({ params }) => {
    await delay(400);
    const booking = db.bookings.find(b => b.confirmationToken === params.token);
    if (!booking) return problem(404, 'BOOKING_NOT_FOUND', "No s'ha trobat la reserva.");
    if (!db.contracts.some(contract => contract.bookingId === booking.id)) {
      return problem(404, 'CONTRACT_NOT_FOUND', "No s'ha trobat el contracte signat.");
    }
    return pdfResponse('contracte.pdf');
  }),
];
