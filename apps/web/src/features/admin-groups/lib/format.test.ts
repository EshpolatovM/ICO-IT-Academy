import { describe, expect, it } from 'vitest';

import { formatDateOnly, personName } from './format';

describe('format', () => {
  it('formatDateOnly — vaqt zonasisiz DD.MM.YYYY, null — "—"', () => {
    expect(formatDateOnly('2026-12-01')).toBe('01.12.2026');
    expect(formatDateOnly(null)).toBe('—');
  });

  it('personName — ism-familiya yoki "—"', () => {
    expect(personName({ firstName: 'Ali', lastName: 'Valiyev' })).toBe('Ali Valiyev');
    expect(personName(null)).toBe('—');
  });
});
