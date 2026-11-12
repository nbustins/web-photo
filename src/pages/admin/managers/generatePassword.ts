/** 16 characters: long enough to satisfy the policy, short enough to copy by hand. */
const LENGTH = 16;

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
/** Quotes, spaces and backslashes are left out so the value survives copy/paste and chat. */
const SPECIAL = '!@#$%^&*-_=+?';

const ALL = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

/** Uniform index in `[0, max)` without modulo bias. */
function randomIndex(max: number): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

function pick(charset: string): string {
  return charset[randomIndex(charset.length)];
}

/**
 * Client-side only: the API never generates a password (spec S4 of the backend ODD).
 * One character from each class guarantees the policy, then the value is shuffled so the
 * guaranteed characters are not always in the same positions.
 */
export function generateManagerPassword(): string {
  const chars = [pick(UPPERCASE), pick(LOWERCASE), pick(DIGITS), pick(SPECIAL)];
  while (chars.length < LENGTH) chars.push(pick(ALL));

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1);
    [chars[index], chars[swap]] = [chars[swap], chars[index]];
  }

  return chars.join('');
}
