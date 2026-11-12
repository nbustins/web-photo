import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../mock.db';
import { weddingManagerFixtures } from '../fixtures/wedding-manager.fixtures';
import { weddingManagerHandlers } from './wedding-managers.handlers';

const BASE = 'http://localhost:5099';
const server = setupServer(...weddingManagerHandlers);

const call = (path: string, init?: RequestInit) => fetch(`${BASE}${path}`, init);
const json = (body: unknown, method = 'POST'): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

describe('wedding managers MSW handlers', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    db.weddingManagers = structuredClone(weddingManagerFixtures);
  });

  it('lists only the managers of that wedding, ordered and without a password', async () => {
    const response = await call('/api/weddings/1/managers');
    const body = (await response.json()) as Record<string, unknown>[];

    expect(response.status).toBe(200);
    expect(body.map(manager => manager.id)).toEqual([1, 2]);
    expect(body.every(manager => !('password' in manager) && !('passwordHash' in manager))).toBe(true);
  });

  it('answers an empty list for a wedding without managers', async () => {
    const response = await call('/api/weddings/2/managers');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
  });

  it('returns 404 WEDDING_NOT_FOUND for an unknown wedding', async () => {
    const response = await call('/api/weddings/999/managers');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ errorCode: 'WEDDING_NOT_FOUND' });
  });

  it('creates a manager with a lowercased email and a Location header', async () => {
    const response = await call(
      '/api/weddings/1/managers',
      json({ email: 'New.Manager@Example.com', password: 'Aa1!abcdefgh' }),
    );
    const body = (await response.json()) as { id: number; email: string; weddingId: number };

    expect(response.status).toBe(201);
    expect(body).toMatchObject({ email: 'new.manager@example.com', weddingId: 1 });
    expect(response.headers.get('Location')).toBe(`/api/weddings/1/managers/${body.id}`);
    expect(body).not.toHaveProperty('password');
  });

  it('rejects a duplicate email case-insensitively', async () => {
    const response = await call(
      '/api/weddings/1/managers',
      json({ email: 'GESTOR.ANNA@example.com', password: 'Aa1!abcdefgh' }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ errorCode: 'USER_EMAIL_EXISTS' });
  });

  it('rejects a password that breaks the policy', async () => {
    const response = await call(
      '/api/weddings/1/managers',
      json({ email: 'weak@example.com', password: 'short' }),
    );
    const body = (await response.json()) as {
      errorCode: string;
      errors: Record<string, string[]>;
    };

    expect(response.status).toBe(400);
    expect(body.errorCode).toBe('VALIDATION_ERROR');
    // Only the field key is pinned: the English detail is the mock's business, never the UI's.
    expect(Object.keys(body.errors)).toEqual(['password']);
  });

  it('changes the email of a manager of that wedding', async () => {
    const response = await call(
      '/api/weddings/1/managers/1',
      json({ email: 'renamed@example.com' }, 'PUT'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ email: 'renamed@example.com' });
  });

  it('returns USER_NOT_FOUND for a manager of another wedding', async () => {
    const response = await call(
      '/api/weddings/2/managers/1',
      json({ email: 'renamed@example.com' }, 'PUT'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ errorCode: 'USER_NOT_FOUND' });
  });

  it('resets a password with 204 and rejects a weak one without changing anything', async () => {
    const ok = await call(
      '/api/weddings/1/managers/1/reset-password',
      json({ newPassword: 'Aa1!abcdefgh' }),
    );
    expect(ok.status).toBe(204);

    const weak = await call(
      '/api/weddings/1/managers/1/reset-password',
      json({ newPassword: 'Aa1!short' }),
    );
    expect(weak.status).toBe(400);
    await expect(weak.json()).resolves.toMatchObject({ errorCode: 'VALIDATION_ERROR' });
  });

  it('deletes a manager and frees the email', async () => {
    const deleted = await call('/api/weddings/1/managers/1', { method: 'DELETE' });
    expect(deleted.status).toBe(204);

    const recreated = await call(
      '/api/weddings/1/managers',
      json({ email: 'gestor.anna@example.com', password: 'Aa1!abcdefgh' }),
    );
    expect(recreated.status).toBe(201);
  });
});
