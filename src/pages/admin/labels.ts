import type { BookingStatus, Weekday } from '../../services/booking/booking.admin.api';
import type { ImageRightsConsent } from '../../services/booking/booking.api';

export const STATUS_LABEL: Record<BookingStatus, string> = {
  Requested: 'SOL·LICITAT',
  Confirmed: 'CONFIRMAT',
  Paid: 'PAGAT',
  Cancelled: 'CANCEL·LAT',
};

export const STATUS_COLOR: Record<BookingStatus, string> = {
  Requested: 'gold',
  Confirmed: 'blue',
  Paid: 'green',
  Cancelled: 'red',
};

// Allowed admin transitions (API 001 §7). Cancelled is terminal.
export const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  Requested: ['Confirmed', 'Cancelled'],
  Confirmed: ['Paid', 'Cancelled'],
  Paid: ['Cancelled'],
  Cancelled: [],
};

export const IMAGE_RIGHTS_LABEL: Record<ImageRightsConsent, string> = {
  GrantAll: 'SI CEDEIXO ELS DRETS',
  DenyAll: 'NO CEDEIXO ELS DRETS',
  GrantMineDenyMinors: 'NO CEDEIXO ELS DRETS DELS MENORS PERO SI ELS MEUS',
};

// DayOfWeek names (API), displayed Mon-first.
export const WEEKDAY_LABEL: Record<Weekday, string> = {
  Monday: 'Dilluns',
  Tuesday: 'Dimarts',
  Wednesday: 'Dimecres',
  Thursday: 'Dijous',
  Friday: 'Divendres',
  Saturday: 'Dissabte',
  Sunday: 'Diumenge',
};

export const WEEKDAYS_MON_FIRST: Weekday[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const STUDIO_TZ = 'Europe/Madrid';

export function formatInstant(iso: string): string {
  return new Date(iso).toLocaleString('ca-ES', {
    timeZone: STUDIO_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
