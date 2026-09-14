import { http, HttpResponse } from 'msw';
import type { LoginResponse } from '../../services/auth/types';
import { MOCK_JWT, TOKEN_LIFETIME_MINUTES, mockAdminUser } from '../fixtures/auth.fixtures';
import { api, delay, isoUtc } from '../mock.utils';

/**
 * Any credentials are accepted, and no other handler checks the Authorization header —
 * the point is to get into the admin panel to look at it, not to rehearse authentication.
 */
export const authHandlers = [
  http.post(api('/api/auth/login'), async () => {
    await delay(300);
    const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MINUTES * 60_000);
    return HttpResponse.json<LoginResponse>({
      token: MOCK_JWT,
      expiresAt: isoUtc(expiresAt),
      user: mockAdminUser,
    });
  }),

  http.get(api('/api/auth/me'), async () => {
    await delay(150);
    return HttpResponse.json(mockAdminUser);
  }),
];
