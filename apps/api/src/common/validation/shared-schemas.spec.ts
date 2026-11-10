import {
  formatStudentCode,
  offsetPaginationQuerySchema,
  passwordSchema,
  phoneSchema,
} from '@lms/shared';

/** `@lms/shared` sxemalari (seed/CLI va keyingi DTO'lar shulardan foydalanadi). */
describe('@lms/shared sxemalari', () => {
  it.each(['Parol123', 'abcdefg1', 'Ўзбек1234'])('parol siyosatiga mos: %s', (password) => {
    expect(passwordSchema.safeParse(password).success).toBe(true);
  });

  it.each(['Pa1', '12345678', 'faqatharf'])('parol siyosatiga mos emas: %s', (password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });

  it('telefonni normalizatsiya qiladi (E.164)', () => {
    expect(phoneSchema.parse('+998 (90) 123-45-67')).toBe('+998901234567');
  });

  it.each(['998901234567', '+0123456789', '+99', 'abc'])("noto'g'ri telefon: %s", (phone) => {
    expect(phoneSchema.safeParse(phone).success).toBe(false);
  });

  it('student kodi formati', () => {
    expect(formatStudentCode(10_245n)).toBe('ST-10245');
  });

  it('pagination: standart qiymatlar va chegaralar', () => {
    expect(offsetPaginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    expect(offsetPaginationQuerySchema.safeParse({ pageSize: '101' }).success).toBe(false);
    expect(offsetPaginationQuerySchema.safeParse({ page: '0' }).success).toBe(false);
  });
});
