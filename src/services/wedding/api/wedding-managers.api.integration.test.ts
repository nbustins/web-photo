import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../mocks/mock.db';
import { weddingManagerFixtures } from '../../../mocks/fixtures/wedding-manager.fixtures';
import { weddingManagerHandlers } from '../../../mocks/handlers/wedding-managers.handlers';
import {
  createWeddingManager,
  deleteWeddingManager,
  fetchWeddingManagers,
  resetWeddingManagerPassword,
  updateWeddingManagerEmail,
} from './wedding-managers.api';

const server = setupServer(...weddingManagerHandlers);

describe('wedding-managers API client end to end', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  beforeEach(() => { db.weddingManagers = structuredClone(weddingManagerFixtures); });

  it('walks list -> create -> update -> reset(204) -> delete(204) -> list', async () => {
    const list = await fetchWeddingManagers(1);
    expect(list.map(manager => manager.id)).toEqual([1, 2]);
    expect(list.every(manager => !('password' in manager))).toBe(true);

    const created = await createWeddingManager(1, { email: 'E2E@Example.com', password: 'Aa1!abcdefgh' });
    expect(created.email).toBe('e2e@example.com');

    const updated = await updateWeddingManagerEmail(1, created.id, 'renamed@example.com');
    expect(updated.email).toBe('renamed@example.com');

    await expect(resetWeddingManagerPassword(1, created.id, 'Aa1!zzzzzzzz')).resolves.toBeUndefined();
    await expect(deleteWeddingManager(1, created.id)).resolves.toBeUndefined();

    const after = await fetchWeddingManagers(1);
    expect(after.map(manager => manager.id)).toEqual([1, 2]);
  });

  it('propagates 409 USER_EMAIL_EXISTS', async () => {
    await expect(
      createWeddingManager(1, { email: 'gestor.anna@example.com', password: 'Aa1!abcdefgh' }),
    ).rejects.toMatchObject({ status: 409, code: 'USER_EMAIL_EXISTS' });
  });

  it('propagates 404 USER_NOT_FOUND for a manager of another wedding', async () => {
    await expect(resetWeddingManagerPassword(2, 1, 'Aa1!abcdefgh')).rejects.toMatchObject({
      status: 404,
      code: 'USER_NOT_FOUND',
    });
  });
});
