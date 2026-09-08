import { GuestServiceProvider } from './types';
import { ApiGuestService } from './api.service';

/**
 * Mock data no longer lives behind this seam: `npm run dev:mock` intercepts the network
 * with MSW (src/mocks/), which covers the whole API instead of just the guest surface.
 */
export const guestService: GuestServiceProvider = new ApiGuestService();

export type { GuestServiceProvider } from './types';
