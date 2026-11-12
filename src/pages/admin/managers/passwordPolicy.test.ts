import { describe, expect, it } from 'vitest';
import { validateManagerPassword } from './passwordPolicy';

/**
 * Mirrors the API policy (wedding-manager-api `PasswordPolicy`): 12+ characters,
 * at most 72 UTF-8 bytes, one class of each kind.
 */
const VALID = 'Aa1!abcdefgh';

describe('validateManagerPassword', () => {
  it('accepts a 12-character password with every class', () => {
    expect(validateManagerPassword(VALID)).toBeNull();
  });

  it('rejects fewer than 12 characters', () => {
    expect(validateManagerPassword('Aa1!abcdefg')).toBe(
      'La contrasenya ha de tenir com a mínim 12 caràcters.',
    );
  });

  it('accepts exactly 72 UTF-8 bytes', () => {
    const password = `Aa1!${'a'.repeat(68)}`;
    expect(new TextEncoder().encode(password)).toHaveLength(72);
    expect(validateManagerPassword(password)).toBeNull();
  });

  it('rejects more than 72 UTF-8 bytes', () => {
    const password = `Aa1!${'a'.repeat(69)}`;
    expect(new TextEncoder().encode(password)).toHaveLength(73);
    expect(validateManagerPassword(password)).toBe(
      'La contrasenya no pot superar els 72 bytes en UTF-8.',
    );
  });

  it('counts UTF-8 bytes, not characters, for the cap', () => {
    // 4 ASCII + 34 two-byte characters = 72 bytes, only 38 characters long.
    const atLimit = `Aa1!${'é'.repeat(34)}`;
    expect(new TextEncoder().encode(atLimit)).toHaveLength(72);
    expect(validateManagerPassword(atLimit)).toBeNull();

    const overLimit = `Aa1!${'é'.repeat(35)}`;
    expect(new TextEncoder().encode(overLimit)).toHaveLength(74);
    expect(validateManagerPassword(overLimit)).toBe(
      'La contrasenya no pot superar els 72 bytes en UTF-8.',
    );
  });

  it('rejects a password without an uppercase letter', () => {
    expect(validateManagerPassword('aa1!abcdefgh')).toBe(
      'La contrasenya ha de contenir almenys una majúscula.',
    );
  });

  it('rejects a password without a lowercase letter', () => {
    expect(validateManagerPassword('AA1!ABCDEFGH')).toBe(
      'La contrasenya ha de contenir almenys una minúscula.',
    );
  });

  it('rejects a password without a digit', () => {
    expect(validateManagerPassword('Aa!!abcdefgh')).toBe(
      'La contrasenya ha de contenir almenys un número.',
    );
  });

  it('rejects a password without a special character', () => {
    expect(validateManagerPassword('Aa11abcdefgh')).toBe(
      'La contrasenya ha de contenir almenys un caràcter especial.',
    );
  });

  it('reports the length rule first when several rules fail', () => {
    expect(validateManagerPassword('short')).toBe(
      'La contrasenya ha de tenir com a mínim 12 caràcters.',
    );
  });
});
