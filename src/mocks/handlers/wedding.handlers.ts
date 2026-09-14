import { http, HttpResponse } from 'msw';
import { db, nextId } from '../mock.db';
import type { MockInvitation } from '../fixtures/wedding.fixtures';
import { api, delay, isoUtc, problem } from '../mock.utils';

const weddingOf = (invitation: MockInvitation) => db.weddings.find(w => w.id === invitation.weddingId);

/** The public InvitationDto: the guest page never sees the wedding id. */
function toInvitationDto(invitation: MockInvitation) {
  const wedding = weddingOf(invitation);
  return {
    id: invitation.id,
    label: invitation.label,
    inviteCode: invitation.inviteCode,
    maxAddedGuests: invitation.maxAddedGuests,
    weddingTitle: wedding?.title ?? '',
    eventDate: wedding?.eventDate ?? null,
    notes: invitation.notes,
    guests: invitation.guests,
  };
}

const findInvitation = (slug: string, code: string) =>
  db.invitations.find(invitation => weddingOf(invitation)?.slug === slug && invitation.inviteCode === code);

export const weddingHandlers = [
  // --- Public --------------------------------------------------------------

  http.get(api('/api/public/weddings/:slug'), async ({ params }) => {
    await delay(300);
    const wedding = db.weddings.find(w => w.slug === params.slug);
    if (!wedding) return problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
    return HttpResponse.json({ slug: wedding.slug, title: wedding.title, eventDate: wedding.eventDate });
  }),

  http.get(api('/api/public/weddings/:slug/photos'), async ({ params }) => {
    await delay(250);
    const wedding = db.weddings.find(w => w.slug === params.slug);
    if (!wedding) return problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
    return HttpResponse.json(wedding.photos.map(url => ({ url })));
  }),

  http.get(api('/api/public/weddings/:slug/invites/:code'), async ({ params }) => {
    await delay(300);
    const invitation = findInvitation(String(params.slug), String(params.code));
    if (!invitation) return problem(404, 'INVITATION_NOT_FOUND', "No s'ha trobat la invitació.");
    return HttpResponse.json(toInvitationDto(invitation));
  }),

  http.post(api('/api/public/weddings/:slug/invites/:code/confirm'), async ({ params, request }) => {
    await delay(500);
    const invitation = findInvitation(String(params.slug), String(params.code));
    if (!invitation) return problem(404, 'INVITATION_NOT_FOUND', "No s'ha trobat la invitació.");

    const body = (await request.json()) as {
      notes: string | null;
      guests: { id: number | null; name: string; attending: boolean | null }[];
    };

    const added = body.guests.filter(guest => guest.id === null).length;
    if (added > invitation.maxAddedGuests) {
      return problem(400, 'GUEST_LIMIT_EXCEEDED', "S'ha superat el nombre màxim de convidats.");
    }

    invitation.notes = body.notes;
    invitation.guests = body.guests.map(guest => ({
      // A null id is a guest the family just added; the API assigns it one on save.
      id: guest.id ?? nextId('guest'),
      name: guest.name,
      isPredefined: invitation.guests.find(existing => existing.id === guest.id)?.isPredefined ?? false,
      attending: guest.attending,
    }));

    return HttpResponse.json(toInvitationDto(invitation));
  }),

  // --- Authenticated -------------------------------------------------------

  http.get(api('/api/weddings/by-slug/:slug'), async ({ params }) => {
    await delay(250);
    const wedding = db.weddings.find(w => w.slug === params.slug);
    if (!wedding) return problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
    return HttpResponse.json({
      id: wedding.id,
      slug: wedding.slug,
      title: wedding.title,
      eventDate: wedding.eventDate,
    });
  }),

  /** Flat: one row per guest, not per invitation. */
  http.get(api('/api/weddings/:weddingId/confirmations/list'), async ({ params }) => {
    await delay(350);
    const weddingId = Number(params.weddingId);
    if (!db.weddings.some(w => w.id === weddingId)) {
      return problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
    }

    const rows = db.invitations
      .filter(invitation => invitation.weddingId === weddingId)
      .flatMap(invitation =>
        invitation.guests.map(guest => ({
          invitationId: invitation.id,
          label: invitation.label,
          email: invitation.email,
          inviteCode: invitation.inviteCode,
          maxAddedGuests: invitation.maxAddedGuests,
          notes: invitation.notes,
          guestId: guest.id,
          guestName: guest.name,
          isPredefined: guest.isPredefined,
          guestAttending: guest.attending,
        })),
      );

    return HttpResponse.json(rows);
  }),

  http.get(api('/api/weddings'), async () => {
    await delay(250);
    const weddings = db.weddings.map(wedding => ({
      id: wedding.id,
      slug: wedding.slug,
      title: wedding.title,
      eventDate: wedding.eventDate,
      closingDate: wedding.closingDate,
      createdAt: wedding.createdAt,
      guestCount: db.invitations
        .filter(invitation => invitation.weddingId === wedding.id)
        .reduce((total, invitation) => total + invitation.guests.length, 0),
    }));
    return HttpResponse.json(weddings);
  }),

  /** Multipart, not JSON: `wedding` is a JSON string and `guestFile` is required. */
  http.post(api('/api/weddings'), async ({ request }) => {
    await delay(600);
    const form = await request.formData();
    const payload = JSON.parse(String(form.get('wedding') ?? '{}')) as {
      slug: string;
      title: string;
      eventDate?: string | null;
      closingDate?: string | null;
      codeLength?: number;
    };

    if (!form.get('guestFile')) {
      return problem(400, 'GUEST_FILE_REQUIRED', 'Cal el fitxer de convidats.');
    }
    if (db.weddings.some(wedding => wedding.slug === payload.slug)) {
      return problem(409, 'WEDDING_SLUG_EXISTS', 'Ja existeix una boda amb aquest slug.');
    }
    if ((payload.codeLength ?? 6) < 6) {
      return problem(400, 'WEDDING_CODE_TOO_SHORT', 'El codi ha de tenir com a mínim 6 caràcters.');
    }

    const wedding = {
      id: nextId('wedding'),
      slug: payload.slug,
      title: payload.title,
      eventDate: payload.eventDate ?? null,
      closingDate: payload.closingDate ?? null,
      createdAt: isoUtc(new Date()),
      photos: [],
    };
    db.weddings.push(wedding);

    return HttpResponse.json({ ...wedding, invitations: [] }, { status: 201 });
  }),
];
