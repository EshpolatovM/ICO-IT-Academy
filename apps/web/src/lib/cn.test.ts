import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('shartli klasslarni birlashtiradi', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });

  it("to'qnashgan klasslardan oxirgisini qoldiradi", () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it("shrift o'lchami va semantik matn rangini ikkalasini saqlaydi", () => {
    expect(cn('text-sm', 'text-text-muted')).toBe('text-sm text-text-muted');
  });
});
