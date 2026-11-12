import { http, HttpResponse } from 'msw';
import { db, nextId } from '../mock.db';
import type { MockWeddingManager } from '../fixtures/wedding-manager.fixtures';
import { api, delay, isoUtc, problem, validationProblem } from '../mock.utils';

/** Mirrors the API email check (`[EmailAddress]`) closely enough for the mock. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors `PasswordPolicy` from wedding-manager-api; messages match its English details. */
function passwordError(password: string): string | null {
  if (password.length < 12) return 'Password must contain at least 12 characters.';
  if (new TextEncoder().encode(password).length > 72) {
    return 'Password must not exceed 72 bytes in UTF-8.';
  }
  if (!/\p{Lu}/u.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/\p{Ll}/u.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/\p{Nd}/u.test(password)) return 'Password must contain at least one digit.';
  if (!/[^\p{L}\p{N}]/u.test(password)) {
    return 'Password must contain at least one special (non-alphanumeric) character.';
  }
  return null;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const weddingExists = (weddingId: number) => db.weddings.some(wedding => wedding.id === weddingId);

/** A manager of THIS wedding, or undefined for both "does not exist" and "belongs elsewhere". */
const managerOf = (weddingId: number, userId: number) =>
  db.weddingManagers.find(manager => manager.id === userId && manager.weddingId === weddingId);

const emailTaken = (email: string, exceptId?: number) =>
  db.weddingManagers.some(
    manager => manager.id !== exceptId && manager.email.toLowerCase() === email.toLowerCase(),
  );

const notFoundWedding = () => problem(404, 'WEDDING_NOT_FOUND', "No s'ha trobat la boda.");
const notFoundManager = () => problem(404, 'USER_NOT_FOUND', "No s'ha trobat l'usuari.");
const emailExists = () =>
  problem(409, 'USER_EMAIL_EXISTS', 'Ja existeix un usuari amb aquest email.');

/** Ordered by createdAt then id, like the endpoint. */
const managersOf = (weddingId: number): MockWeddingManager[] =>
  db.weddingManagers
    .filter(manager => manager.weddingId === weddingId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);

export const weddingManagerHandlers = [
  http.get(api('/api/weddings/:weddingId/managers'), async ({ params }) => {
    await delay(300);
    const weddingId = Number(params.weddingId);
    if (!weddingExists(weddingId)) return notFoundWedding();
    return HttpResponse.json(managersOf(weddingId));
  }),

  http.post(api('/api/weddings/:weddingId/managers'), async ({ params, request }) => {
    await delay(450);
    const weddingId = Number(params.weddingId);
    if (!weddingExists(weddingId)) return notFoundWedding();

    const body = (await request.json()) as { email?: string; password?: string };
    const email = normalizeEmail(body.email ?? '');
    const password = body.password ?? '';
    const errors: Record<string, string[]> = {};

    if (!email) errors.email = ['The Email field is required.'];
    else if (!EMAIL.test(email)) errors.email = ['The Email field is not a valid e-mail address.'];

    const passwordProblem = passwordError(password);
    if (passwordProblem) errors.password = [passwordProblem];
    if (Object.keys(errors).length > 0) return validationProblem(errors);

    if (emailTaken(email)) return emailExists();

    const manager: MockWeddingManager = {
      id: nextId('weddingManager'),
      email,
      weddingId,
      createdAt: isoUtc(new Date()),
    };
    db.weddingManagers.push(manager);
    return HttpResponse.json(manager, {
      status: 201,
      headers: { Location: `/api/weddings/${weddingId}/managers/${manager.id}` },
    });
  }),

  http.put(api('/api/weddings/:weddingId/managers/:userId'), async ({ params, request }) => {
    await delay(400);
    const weddingId = Number(params.weddingId);
    if (!weddingExists(weddingId)) return notFoundWedding();
    const manager = managerOf(weddingId, Number(params.userId));
    if (!manager) return notFoundManager();

    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? '');
    if (!email) return validationProblem({ email: ['The Email field is required.'] });
    if (!EMAIL.test(email)) {
      return validationProblem({ email: ['The Email field is not a valid e-mail address.'] });
    }
    if (emailTaken(email, manager.id)) return emailExists();

    manager.email = email;
    return HttpResponse.json(manager);
  }),

  http.post(api('/api/weddings/:weddingId/managers/:userId/reset-password'), async ({ params, request }) => {
    await delay(450);
    const weddingId = Number(params.weddingId);
    if (!weddingExists(weddingId)) return notFoundWedding();
    if (!managerOf(weddingId, Number(params.userId))) return notFoundManager();

    const body = (await request.json()) as { newPassword?: string };
    const passwordProblem = passwordError(body.newPassword ?? '');
    if (passwordProblem) return validationProblem({ newPassword: [passwordProblem] });

    // The mock stores no password: the API hashes it and never returns it either.
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(api('/api/weddings/:weddingId/managers/:userId'), async ({ params }) => {
    await delay(350);
    const weddingId = Number(params.weddingId);
    if (!weddingExists(weddingId)) return notFoundWedding();
    const index = db.weddingManagers.findIndex(
      manager => manager.id === Number(params.userId) && manager.weddingId === weddingId,
    );
    if (index === -1) return notFoundManager();

    db.weddingManagers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
