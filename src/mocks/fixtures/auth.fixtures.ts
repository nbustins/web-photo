import type { AuthUser } from '../../services/auth/types';

/**
 * Any credentials log you in as this admin: the mock never validates the password, and no
 * handler checks the Authorization header. auth.store.ts only enforces expiry client-side.
 */
export const mockAdminUser: AuthUser = {
  id: 1,
  email: 'admin@test.com',
  role: 'Admin',
  weddingId: null,
};

export const MOCK_JWT = 'mock.jwt.token';

/** JWT lifetime in the API's appsettings.json. */
export const TOKEN_LIFETIME_MINUTES = 120;
