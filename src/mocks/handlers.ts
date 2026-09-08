import { authHandlers } from './handlers/auth.handlers';
import { bookingHandlers } from './handlers/booking.handlers';
import { bookingAdminHandlers } from './handlers/booking-admin.handlers';
import { weddingHandlers } from './handlers/wedding.handlers';

/**
 * Order matters: MSW matches in sequence, so literal paths must come before the patterns
 * that would swallow them (/api/bookings/availability before /api/bookings/:token).
 */
export const handlers = [...authHandlers, ...bookingHandlers, ...bookingAdminHandlers, ...weddingHandlers];
