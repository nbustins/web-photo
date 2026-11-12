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

describe('wedding managers MSW — adversarial', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  beforeEach(() => { db.weddingManagers = structuredClone(weddingManagerFixtures); });

  it('orders by createdAt then id when ids are out of insertion order', async () => {
    db.weddingManagers = [
      { id: 9, email: 'late@example.com', weddingId: 1, createdAt: '2026-03-01T00:00:00.000Z' },
      { id: 8, email: 'same-a@example.com', weddingId: 1, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 7, email: 'same-b@example.com', weddingId: 1, createdAt: '2026-01-01T00:00:00.000Z' },
    ];
    const response = await call('/api/weddings/1/managers');
    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: number }[];
    expect(body.map(manager => manager.id)).toEqual([7, 8, 9]);
  });

  it('deletes the last manager and leaves an empty list', async () => {
    for (const id of [1, 2]) {
      const response = await call(`/api/weddings/1/managers/${id}`, { method: 'DELETE' });
      expect(response.status).toBe(204);
    }
    const list = await call('/api/weddings/1/managers');
    expect(list.status).toBe(200);
    await expect(list.json()).resolves.toEqual([]);
  });

  it('answers USER_NOT_FOUND for a manager of another wedding on put/reset/delete', async () => {
    const cases: [string, RequestInit][] = [
      ['/api/weddings/2/managers/1', json({ email: 'x@example.com' }, 'PUT')],
      ['/api/weddings/2/managers/1/reset-password', json({ newPassword: 'Aa1!abcdefgh' })],
      ['/api/weddings/2/managers/1', { method: 'DELETE' }],
    ];
    for (const [path, init] of cases) {
      const response = await call(path, init);
      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toMatchObject({ errorCode: 'USER_NOT_FOUND' });
    }
  });

  it('answers WEDDING_NOT_FOUND on all five endpoints for an unknown wedding', async () => {
    const cases: [string, RequestInit][] = [
      ['/api/weddings/999/managers', { method: 'GET' }],
      ['/api/weddings/999/managers', json({ email: 'a@example.com', password: 'Aa1!abcdefgh' })],
      ['/api/weddings/999/managers/1', json({ email: 'a@example.com' }, 'PUT')],
      ['/api/weddings/999/managers/1/reset-password', json({ newPassword: 'Aa1!abcdefgh' })],
      ['/api/weddings/999/managers/1', { method: 'DELETE' }],
    ];
    for (const [path, init] of cases) {
      const response = await call(path, init);
      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toMatchObject({ errorCode: 'WEDDING_NOT_FOUND' });
    }
  });

  it('ignores a client-sent role/weddingId and never echoes the password', async () => {
    const response = await call(
      '/api/weddings/1/managers',
      json({ email: 'Sneaky@Example.com', password: 'Aa1!abcdefgh', role: 'Admin', weddingId: 2 }),
    );
    expect(response.status).toBe(201);
    const text = await response.text();
    expect(text).not.toContain('Aa1!abcdefgh');
    expect(text).not.toContain('password');
    expect(JSON.parse(text)).toMatchObject({ email: 'sneaky@example.com', weddingId: 1 });
    expect(JSON.parse(text)).not.toHaveProperty('role');
    const listText = await (await call('/api/weddings/1/managers')).text();
    expect(listText).not.toContain('Aa1!abcdefgh');
    expect(listText).not.toContain('password');
  });

  it('rejects an invalid email with VALIDATION_ERROR and a duplicate case-insensitively', async () => {
    const invalid = await call('/api/weddings/1/managers', json({ email: 'nope', password: 'Aa1!abcdefgh' }));
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toMatchObject({ errorCode: 'VALIDATION_ERROR' });

    const duplicate = await call(
      '/api/weddings/1/managers',
      json({ email: 'GESTOR.ANNA@EXAMPLE.COM', password: 'Aa1!abcdefgh' }),
    );
    expect(duplicate.status).toBe(409);
    await expect(duplicate.json()).resolves.toMatchObject({ errorCode: 'USER_EMAIL_EXISTS' });
  });
});
