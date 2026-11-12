import { describe, expect, it } from 'vitest';
import { generateManagerPassword } from './generatePassword';
import { validateManagerPassword } from './passwordPolicy';

const SPECIAL = /[^A-Za-z0-9]/;

describe('generateManagerPassword', () => {
  it('returns 16 characters', () => {
    expect(generateManagerPassword()).toHaveLength(16);
  });

  it('always satisfies the password policy', () => {
    for (let i = 0; i < 50; i += 1) {
      const password = generateManagerPassword();
      expect(validateManagerPassword(password)).toBeNull();
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(SPECIAL);
    }
  });

  it('does not repeat the same value across calls', () => {
    const generated = new Set(Array.from({ length: 20 }, () => generateManagerPassword()));
    expect(generated.size).toBeGreaterThan(1);
  });
});
