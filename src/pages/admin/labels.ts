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

/**
 * What an admin is agreeing to before a status change: what it triggers and whether it can be
 * undone. Cancelling is terminal (API 001 §7) and confirming sends the client an email, so
 * neither should happen on a stray click.
 */
/** Button copy for a transition: the action to take, not the state it lands on. */
export const STATUS_ACTION_LABEL: Record<BookingStatus, string> = {
  Requested: 'Tornar a pendent',
  Confirmed: 'Confirmar',
  Paid: 'Marcar pagada',
  Cancelled: 'Cancel·lar',
};

export const STATUS_CONFIRM: Record<BookingStatus, {
  title: string;
  description: string;
  okText: string;
  danger?: boolean;
}> = {
  Requested: {
    title: 'Tornar a sol·licitada?',
    description: 'La reserva torna a quedar pendent de revisar.',
    okText: 'Sí, tornar-hi',
  },
  Confirmed: {
    title: 'Confirmar la reserva?',
    description: "S'enviarà l'email de confirmació a la clienta automàticament.",
    okText: 'Sí, confirmar',
  },
  Paid: {
    title: 'Marcar com a pagada?',
    description: 'No s\'envia cap email: només queda registrat que ja has cobrat.',
    okText: 'Sí, està pagada',
  },
  Cancelled: {
    title: 'Cancel·lar la reserva?',
    description: "L'hora torna a quedar lliure i una reserva cancel·lada ja no es pot reactivar.",
    okText: 'Sí, cancel·lar',
    danger: true,
  },
};
