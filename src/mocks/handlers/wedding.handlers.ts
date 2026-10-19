import { http, HttpResponse } from 'msw';
import { db, nextId } from '../mock.db';
import type { MockInvitation, MockWedding } from '../fixtures/wedding.fixtures';
import { api, delay, isoUtc, problem, validationProblem } from '../mock.utils';
import { NO_FEATURES } from '../fixtures/wedding.fixtures';
import type { MockSongRequest, MockWeddingContent, MockWeddingFeatures } from '../fixtures/wedding.fixtures';

const MAX_SONGS = 10;
const MAX_SONG_FIELD = 200;
const MAX_ALLERGENS = 15;
const MAX_ALLERGEN = 100;
/** Wire limits of `WeddingFeaturesContentDto`, keyed by field. */
const CONTENT_LIMITS: Record<keyof MockWeddingContent, { limit: number; key: string }> = {
  hotelInfo: { limit: 10_000, key: 'content.hotelInfo' },
  introductionText: { limit: 2_000, key: 'content.introductionText' },
  weddingPlace: { limit: 500, key: 'content.weddingPlace' },
  schedule: { limit: 10_000, key: 'content.schedule' },
  donations: { limit: 2_000, key: 'content.donations' },
  contact: { limit: 2_000, key: 'content.contact' },
  songRequestsPhrase: { limit: 1_000, key: 'content.songRequestsPhrase' },
  transportToHotelPhrase: { limit: 1_000, key: 'content.transportToHotelPhrase' },
};

const emptyContent = (): MockWeddingContent => ({
  hotelInfo: null,
  introductionText: null,
  weddingPlace: null,
  schedule: null,
  donations: null,
  contact: null,
  songRequestsPhrase: null,
  transportToHotelPhrase: null,
});

/** Blank HTML clears a field; the API sanitizes the value. */
const parseContent = (raw: unknown): MockWeddingContent => {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Partial<MockWeddingContent>;
  const base = emptyContent();
  (Object.keys(base) as (keyof MockWeddingContent)[]).forEach((field) => {
    const text = value[field];
    base[field] = typeof text === 'string' && text.trim() ? text : null;
  });
  return base;
};

/** Case- and accent-insensitive key, used to drop duplicate song requests. */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const parseFeatures = (raw: unknown): MockWeddingFeatures => {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Partial<MockWeddingFeatures>;
  return {
    transportToHotel: value.transportToHotel === true,
    songRequests: value.songRequests === true,
    allergens: value.allergens === true,
  };
};

const weddingOf = (invitation: MockInvitation) => db.weddings.find(w => w.id === invitation.weddingId);

/**
 * Public invitation content: `hotelInfo` only when set (content-driven, no toggle),
 * the standalone fields always present, and each `*Phrase` only while its feature is on.
 */
const toPublicContent = (content: MockWeddingContent, features: MockWeddingFeatures) => ({
  ...(content.hotelInfo ? { hotelInfo: content.hotelInfo } : {}),
  introductionText: content.introductionText,
  weddingPlace: content.weddingPlace,
  schedule: content.schedule,
  donations: content.donations,
  contact: content.contact,
  ...(features.songRequests && { songRequestsPhrase: content.songRequestsPhrase }),
  ...(features.transportToHotel && { transportToHotelPhrase: content.transportToHotelPhrase }),
});

/** The public InvitationDto: the guest page never sees the wedding id. Disabled features omit their fields. */
function toInvitationDto(invitation: MockInvitation) {
  const wedding = weddingOf(invitation);
  const features = wedding?.features ?? NO_FEATURES;
  return {
    id: invitation.id,
    label: invitation.label,
    inviteCode: invitation.inviteCode,
    maxAddedGuests: invitation.maxAddedGuests,
    weddingTitle: wedding?.title ?? '',
    eventDate: wedding?.eventDate ?? null,
    notes: invitation.notes,
    guests: invitation.guests.map(guest => ({
      id: guest.id,
      name: guest.name,
      isPredefined: guest.isPredefined,
      attending: guest.attending,
      ...(features.transportToHotel && { usesTransportToHotel: guest.usesTransportToHotel }),
      ...(features.allergens && { allergens: guest.allergens }),
    })),
    features,
    ...(features.songRequests && { songRequests: invitation.songRequests }),
    content: toPublicContent(wedding?.content ?? emptyContent(), features),
  };
}

const toSettingsDto = (wedding: MockWedding) => ({
  id: wedding.id,
  slug: wedding.slug,
  title: wedding.title,
  eventDate: wedding.eventDate,
  closingDate: wedding.closingDate,
  features: wedding.features,
  content: wedding.content,
});

const findInvitation = (slug: string, code: string) =>
  db.invitations.find(invitation => weddingOf(invitation)?.slug === slug && invitation.inviteCode === code);

export const weddingHandlers = [
  // --- Public --------------------------------------------------------------

  http.get(api('/api/public/weddings/:slug'), async ({ params }) => {
    await delay(300);
    const wedding = db.weddings.find(w => w.slug === params.slug);
    if (!wedding) return problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
    return HttpResponse.json({ slug: wedding.slug, title: wedding.title, eventDate: wedding.eventDate, features: wedding.features });
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
      guests: {
        id: number | null;
        name: string;
        attending: boolean | null;
        usesTransportToHotel?: boolean | null;
        allergens?: string[] | null;
      }[];
      songRequests?: { title?: string | null; artist?: string | null }[] | null;
    };
    const features = weddingOf(invitation)?.features ?? NO_FEATURES;

    const added = body.guests.filter(guest => guest.id === null).length;
    if (added > invitation.maxAddedGuests) {
      return problem(400, 'GUEST_LIMIT_EXCEEDED', "S'ha superat el nombre màxim de convidats.");
    }

    // A disabled feature only rejects meaningful values; null, [] and absent are accepted.
    const disabled = (detail: string) => problem(400, 'FEATURE_IS_DISABLED', detail);
    if (!features.transportToHotel && body.guests.some(g => typeof g.usesTransportToHotel === 'boolean')) {
      return disabled('Transport to hotel is disabled for this wedding.');
    }
    if (!features.allergens && body.guests.some(g => (g.allergens?.length ?? 0) > 0)) {
      return disabled('Allergens are disabled for this wedding.');
    }
    if (!features.songRequests && (body.songRequests?.length ?? 0) > 0) {
      return disabled('Song requests are disabled for this wedding.');
    }

    const errors: Record<string, string[]> = {};
    const songInput = body.songRequests ?? [];
    if (songInput.length > MAX_SONGS) {
      errors.songRequests = [`A maximum of ${MAX_SONGS} song requests is allowed.`];
    }
    songInput.forEach((song, index) => {
      if ((song.title ?? '').length > MAX_SONG_FIELD) {
        errors[`songRequests[${index}].title`] = [`Title must be at most ${MAX_SONG_FIELD} characters.`];
      }
      if ((song.artist ?? '').length > MAX_SONG_FIELD) {
        errors[`songRequests[${index}].artist`] = [`Artist must be at most ${MAX_SONG_FIELD} characters.`];
      }
    });
    body.guests.forEach((guest, index) => {
      const allergens = guest.allergens ?? [];
      if (allergens.length > MAX_ALLERGENS) {
        errors[`guests[${index}].allergens`] = [`A maximum of ${MAX_ALLERGENS} allergens per guest is allowed.`];
      } else if (allergens.some(allergen => allergen.length > MAX_ALLERGEN)) {
        errors[`guests[${index}].allergens`] = [`Each allergen must be at most ${MAX_ALLERGEN} characters.`];
      }
    });
    if (Object.keys(errors).length > 0) return validationProblem(errors);

    // Drop blank titles, then duplicates by title + artist.
    const seen = new Set<string>();
    const songRequests: MockSongRequest[] = [];
    for (const song of songInput) {
      const title = (song.title ?? '').trim();
      if (!title) continue;
      const artist = (song.artist ?? '').trim() || null;
      const key = `${fold(title)}|${fold(artist ?? '')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      songRequests.push({ title, artist });
    }

    invitation.notes = body.notes;
    invitation.songRequests = features.songRequests ? songRequests : [];
    invitation.guests = body.guests.map(guest => {
      const attending = guest.attending === true;
      const allergens = (guest.allergens ?? []).map(a => a.trim()).filter(Boolean);
      return {
        // A null id is a guest the family just added; the API assigns it one on save.
        id: guest.id ?? nextId('guest'),
        name: guest.name,
        isPredefined: invitation.guests.find(existing => existing.id === guest.id)?.isPredefined ?? false,
        attending: guest.attending,
        // Non-attending guests never keep transport or allergens.
        usesTransportToHotel:
          attending && features.transportToHotel && typeof guest.usesTransportToHotel === 'boolean'
            ? guest.usesTransportToHotel
            : null,
        allergens: attending && features.allergens ? allergens : [],
      };
    });

    return HttpResponse.json(toInvitationDto(invitation));
  }),

  // --- Authenticated -------------------------------------------------------

  http.get(api('/api/weddings/by-slug/:slug'), async ({ params }) => {
    await delay(250);
    const wedding = db.weddings.find(w => w.slug === params.slug);
    if (!wedding) return problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
    return HttpResponse.json(toSettingsDto(wedding));
  }),

  http.get(api('/api/weddings/:weddingId'), async ({ params }) => {
    await delay(250);
    const wedding = db.weddings.find(w => w.id === Number(params.weddingId));
    if (!wedding) return problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
    const invitations = db.invitations
      .filter(invitation => invitation.weddingId === wedding.id)
      .map(invitation => ({ ...invitation, weddingId: undefined }));
    return HttpResponse.json({ ...toSettingsDto(wedding), createdAt: wedding.createdAt, invitations });
  }),

  http.put(api('/api/weddings/:weddingId/settings'), async ({ params, request }) => {
    await delay(400);
    const wedding = db.weddings.find(w => w.id === Number(params.weddingId));
    if (!wedding) return problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
    const body = (await request.json()) as { features?: unknown; content?: unknown };
    const content = parseContent(body.content);
    const errors: Record<string, string[]> = {};
    (Object.keys(content) as (keyof MockWeddingContent)[]).forEach(field => {
      const { limit, key } = CONTENT_LIMITS[field];
      if ((content[field]?.length ?? 0) > limit) {
        errors[key] = [`Must be at most ${limit} characters.`];
      }
    });
    if (Object.keys(errors).length > 0) return validationProblem(errors);
    wedding.features = parseFeatures(body.features);
    wedding.content = content;
    return HttpResponse.json(toSettingsDto(wedding));
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
          usesTransportToHotel: guest.usesTransportToHotel,
          allergens: guest.allergens,
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
    const featuresField = form.get('features');
    const payload = JSON.parse(String(form.get('wedding') ?? '{}')) as {
      slug: string;
      title: string;
      eventDate?: string | null;
      closingDate?: string | null;
      codeLength?: number;
      content?: unknown;
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
      features: featuresField ? parseFeatures(JSON.parse(String(featuresField))) : { ...NO_FEATURES },
      content: parseContent(payload.content),
    };
    db.weddings.push(wedding);

    return HttpResponse.json({ ...toSettingsDto(wedding), createdAt: wedding.createdAt, invitations: [] }, { status: 201 });
  }),
];
