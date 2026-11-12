import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api.client';

const mocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('../../api.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api.client')>();
  return { ...actual, ...mocks };
});

const {
  createWeddingManager,
  deleteWeddingManager,
  fetchWeddingManagers,
  resetWeddingManagerPassword,
  updateWeddingManagerEmail,
} = await import('./wedding-managers.api');

const MANAGER = {
  id: 3,
  email: 'manager@example.com',
  weddingId: 7,
  createdAt: '2026-10-01T10:00:00Z',
};

describe('wedding-managers API', () => {
  beforeEach(() => {
    mocks.apiGet.mockReset();
    mocks.apiPost.mockReset();
    mocks.apiPut.mockReset();
    mocks.apiDelete.mockReset();
  });

  it('lists the managers of one wedding', async () => {
    mocks.apiGet.mockResolvedValue([MANAGER]);

    await expect(fetchWeddingManagers(7)).resolves.toEqual([MANAGER]);
    expect(mocks.apiGet).toHaveBeenCalledWith('/api/weddings/7/managers');
  });

  it('creates a manager with email and password', async () => {
    mocks.apiPost.mockResolvedValue(MANAGER);

    await expect(
      createWeddingManager(7, { email: 'manager@example.com', password: 'Aa1!abcdefgh' }),
    ).resolves.toEqual(MANAGER);
    expect(mocks.apiPost).toHaveBeenCalledWith('/api/weddings/7/managers', {
      email: 'manager@example.com',
      password: 'Aa1!abcdefgh',
    });
  });

  it('changes the email of a manager', async () => {
    mocks.apiPut.mockResolvedValue({ ...MANAGER, email: 'new@example.com' });

    await updateWeddingManagerEmail(7, 3, 'new@example.com');
    expect(mocks.apiPut).toHaveBeenCalledWith('/api/weddings/7/managers/3', {
      email: 'new@example.com',
    });
  });

  it('resets the password without returning anything', async () => {
    mocks.apiPost.mockResolvedValue(undefined);

    await expect(resetWeddingManagerPassword(7, 3, 'Aa1!abcdefgh')).resolves.toBeUndefined();
    expect(mocks.apiPost).toHaveBeenCalledWith('/api/weddings/7/managers/3/reset-password', {
      newPassword: 'Aa1!abcdefgh',
    });
  });

  it('deletes a manager', async () => {
    mocks.apiDelete.mockResolvedValue(undefined);

    await expect(deleteWeddingManager(7, 3)).resolves.toBeUndefined();
    expect(mocks.apiDelete).toHaveBeenCalledWith('/api/weddings/7/managers/3');
  });

  it('propagates the ApiError untouched', async () => {
    const error = new ApiError(409, 'duplicate', 'USER_EMAIL_EXISTS');
    mocks.apiPost.mockRejectedValue(error);

    await expect(
      createWeddingManager(7, { email: 'manager@example.com', password: 'Aa1!abcdefgh' }),
    ).rejects.toBe(error);
  });
});
