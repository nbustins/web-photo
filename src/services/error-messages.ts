import { ApiError } from './api.client';

// Mirror of the API error catalogs (spec 011): Shared/Errors/ErrorCodes.cs + Modules/*/​*ErrorCodes.cs.
export type ErrorCode =
  // generic
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'EMAIL_NOT_DELIVERED'
  // auth
  | 'USER_EMAIL_EXISTS'
  | 'USER_NOT_FOUND'
  // wedding
  | 'WEDDING_NOT_FOUND'
  | 'WEDDING_SLUG_EXISTS'
  | 'WEDDING_CODE_TOO_SHORT'
  | 'GUEST_FILE_REQUIRED'
  | 'INVITATION_NOT_FOUND'
  | 'GUEST_LIMIT_EXCEEDED'
  // sessions
  | 'SESSION_TYPE_NOT_FOUND'
  | 'SESSION_GROUP_NOT_FOUND'
  | 'SESSION_GROUP_IN_USE'
  | 'PRICE_TOO_MANY_DECIMALS'
  // booking
  | 'BOOKING_NOT_FOUND'
  | 'BOOKING_NOT_CANCELLABLE'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_STATUS_TRANSITION_INVALID'
  | 'CONTRACT_NOT_FOUND'
  | 'CONTRACT_ALREADY_SIGNED'
  | 'SIGNATURE_TOO_LARGE'
  | 'SIGNATURE_INVALID_IMAGE'
  | 'SIGNATURE_NOT_PNG'
  | 'SESSION_TYPE_NOT_BOOKABLE'
  | 'SLOT_TAKEN'
  | 'SLOT_IN_PAST'
  | 'SLOT_BEYOND_HORIZON'
  | 'SLOT_OUT_OF_SEASON_WINDOW'
  | 'SLOT_OUTSIDE_WEEKLY_AVAILABILITY'
  | 'SLOT_BLOCKED'
  | 'DATE_RANGE_INVALID'
  | 'DATE_RANGE_TOO_LONG'
  | 'TIME_RANGE_INVALID'
  | 'AVAILABILITY_NOT_FOUND'
  | 'BLOCKED_PERIOD_NOT_FOUND';

export const ERROR_MESSAGE: Record<ErrorCode, string> = {
  VALIDATION_ERROR: 'Hi ha camps invàlids. Revisa les dades.',
  INTERNAL_ERROR: "Hi ha hagut un error inesperat. Torna-ho a provar d'aquí una estona.",
  UNAUTHORIZED: 'Cal iniciar sessió per continuar.',
  FORBIDDEN: 'No tens permís per fer aquesta acció.',
  NOT_FOUND: "No s'ha trobat el recurs.",
  RATE_LIMITED: 'Massa intents. Espera uns minuts i torna-ho a provar.',
  EMAIL_NOT_DELIVERED: "No s'ha pogut enviar el correu.",

  USER_EMAIL_EXISTS: 'Ja existeix un usuari amb aquest email.',
  USER_NOT_FOUND: "No s'ha trobat l'usuari.",

  WEDDING_NOT_FOUND: "No s'ha trobat la boda.",
  WEDDING_SLUG_EXISTS: 'Ja existeix una boda amb aquest slug.',
  WEDDING_CODE_TOO_SHORT: 'El codi ha de tenir com a mínim 6 caràcters.',
  GUEST_FILE_REQUIRED: 'Cal el fitxer de convidats.',
  INVITATION_NOT_FOUND: "No s'ha trobat la invitació.",
  GUEST_LIMIT_EXCEEDED: "S'ha superat el nombre màxim de convidats.",

  SESSION_TYPE_NOT_FOUND: "No s'ha trobat el tipus de sessió.",
  SESSION_GROUP_NOT_FOUND: "No s'ha trobat el grup de sessions.",
  SESSION_GROUP_IN_USE: 'El grup té tipus de sessió associats i no es pot eliminar.',
  PRICE_TOO_MANY_DECIMALS: 'El preu no pot tenir més de 2 decimals.',

  BOOKING_NOT_FOUND: "No s'ha trobat la reserva.",
  BOOKING_NOT_CANCELLABLE: 'La reserva ja no es pot cancel·lar.',
  BOOKING_CANCELLED: 'La reserva està cancel·lada.',
  BOOKING_STATUS_TRANSITION_INVALID: 'Aquest canvi d’estat no és possible.',
  CONTRACT_NOT_FOUND: "No s'ha trobat el contracte signat.",
  CONTRACT_ALREADY_SIGNED: 'El contracte ja està signat.',
  SIGNATURE_TOO_LARGE: 'La signatura és massa gran.',
  SIGNATURE_INVALID_IMAGE: 'La signatura no és una imatge vàlida.',
  SIGNATURE_NOT_PNG: 'La signatura ha de ser una imatge PNG.',
  SESSION_TYPE_NOT_BOOKABLE: 'Aquesta sessió no admet reserves.',
  SLOT_TAKEN: "Aquesta hora s'acaba de reservar. Tria'n una altra.",
  SLOT_IN_PAST: 'Aquesta hora ja ha passat.',
  SLOT_BEYOND_HORIZON: 'Aquesta data és massa llunyana per reservar.',
  SLOT_OUT_OF_SEASON_WINDOW: 'Aquesta data queda fora de la temporada de reserves.',
  SLOT_OUTSIDE_WEEKLY_AVAILABILITY: "Aquesta hora queda fora de l'horari disponible.",
  SLOT_BLOCKED: 'Aquesta data no està disponible.',
  DATE_RANGE_INVALID: 'El rang de dates no és vàlid.',
  DATE_RANGE_TOO_LONG: 'El rang de dates és massa llarg.',
  TIME_RANGE_INVALID: "L'hora d'inici ha de ser anterior a la de fi.",
  AVAILABILITY_NOT_FOUND: "No s'ha trobat la franja de disponibilitat.",
  BLOCKED_PERIOD_NOT_FOUND: "No s'ha trobat el període bloquejat.",
};

export const GENERIC_ERROR = 'Hi ha hagut un error';

/** Catalan text for an API error by errorCode; raw English `detail` never reaches the UI. */
export function errorMessage(err: unknown, fallback = GENERIC_ERROR): string {
  if (err instanceof ApiError && err.code && err.code in ERROR_MESSAGE) {
    return ERROR_MESSAGE[err.code as ErrorCode];
  }
  return fallback;
}
