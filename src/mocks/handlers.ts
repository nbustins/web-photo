import { authHandlers } from './handlers/auth.handlers';
import { bookingHandlers } from './handlers/booking.handlers';
import { bookingAdminHandlers } from './handlers/booking-admin.handlers';
import { weddingHandlers } from './handlers/wedding.handlers';
import { weddingManagerHandlers } from './handlers/wedding-managers.handlers';

/**
 * Order matters: MSW matches in sequence, so literal paths must come before the patterns
 * that would swallow them (/api/bookings/availability before /api/bookings/:token).
 * The nested managers paths are literals too, so they run before `/api/weddings/:weddingId`.
 */
export const handlers = [
  ...authHandlers,
  ...bookingHandlers,
  ...bookingAdminHandlers,
  ...weddingManagerHandlers,
  ...weddingHandlers,
];
