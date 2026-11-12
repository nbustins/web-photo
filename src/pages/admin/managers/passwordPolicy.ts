/** Catalan mirror of the API policy (`wedding-manager-api`, `PasswordPolicy`). */
const MIN_LENGTH = 12;
/** BCrypt silently truncates past 72 bytes, so the API rejects instead of weakening. */
const MAX_BYTES = 72;

const MESSAGES = {
  tooShort: 'La contrasenya ha de tenir com a mínim 12 caràcters.',
  tooLong: 'La contrasenya no pot superar els 72 bytes en UTF-8.',
  noUppercase: 'La contrasenya ha de contenir almenys una majúscula.',
  noLowercase: 'La contrasenya ha de contenir almenys una minúscula.',
  noDigit: 'La contrasenya ha de contenir almenys un número.',
  noSpecial: 'La contrasenya ha de contenir almenys un caràcter especial.',
} as const;

export const MANAGER_PASSWORD_RULES = Object.freeze({
  minLength: MIN_LENGTH,
  maxBytes: MAX_BYTES,
});

/**
 * Returns the first failing rule as Catalan copy, or `null` when the password is valid.
 * The order matches the API so the first server-side failure and the first local one agree.
 */
export function validateManagerPassword(password: string): string | null {
  if (password.length < MIN_LENGTH) return MESSAGES.tooShort;
  if (new TextEncoder().encode(password).length > MAX_BYTES) return MESSAGES.tooLong;
  if (!/\p{Lu}/u.test(password)) return MESSAGES.noUppercase;
  if (!/\p{Ll}/u.test(password)) return MESSAGES.noLowercase;
  if (!/\p{Nd}/u.test(password)) return MESSAGES.noDigit;
  if (!/[^\p{L}\p{N}]/u.test(password)) return MESSAGES.noSpecial;
  return null;
}
