import {
  COMMON_PASSWORD_MESSAGE,
  createParentTokenSchema,
  formatStudentCode,
  isCommonPassword,
  offsetPaginationQuerySchema,
  parentExchangeSchema,
  passwordSchema,
  phoneSchema,
} from '@lms/shared';

const TOKEN = 'k2Jd8xQ'.repeat(6) + 'A';

/** `@lms/shared` sxemalari (seed/CLI va keyingi DTO'lar shulardan foydalanadi). */
describe('@lms/shared sxemalari', () => {
  it.each(['Parol123', 'bulut7soat', 'Ўзбек1234'])('parol siyosatiga mos: %s', (password) => {
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

  it.each(['password1', 'PASSWORD1', 'Passw0rd', 'abcd1234', '1q2w3e4r', 'Qwerty123'])(
    "qora ro'yxatdagi parol (katta-kichik harfga sezgir emas) rad etiladi: %s",
    (password) => {
      expect(isCommonPassword(password)).toBe(true);
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(false);
      expect(result.error?.issues.map((issue) => issue.message)).toContain(COMMON_PASSWORD_MESSAGE);
    },
  );

  it("qora ro'yxatda yo'q parol o'tadi", () => {
    expect(isCommonPassword('Yangi$Parol9')).toBe(false);
    expect(passwordSchema.safeParse('Yangi$Parol9').success).toBe(true);
  });

  it("parent exchange: body'siz → { merge: false }; tokenlar formati tekshiriladi", () => {
    expect(TOKEN).toHaveLength(43);
    expect(parentExchangeSchema.parse(undefined)).toEqual({ merge: false });
    expect(parentExchangeSchema.parse({ tokens: [` ${TOKEN} `], merge: true })).toEqual({
      tokens: [TOKEN],
      merge: true,
    });
    expect(parentExchangeSchema.safeParse({ tokens: [] }).success).toBe(false);
    expect(parentExchangeSchema.safeParse({ tokens: ['qisqa'] }).success).toBe(false);
    expect(parentExchangeSchema.safeParse({ tokens: [`${TOKEN.slice(1)}+`] }).success).toBe(false);
    expect(parentExchangeSchema.safeParse({ tokens: Array(11).fill(TOKEN) }).success).toBe(false);
  });

  it('parent token yaratish: label ixtiyoriy, 64 belgigacha', () => {
    expect(createParentTokenSchema.parse(undefined)).toEqual({});
    expect(createParentTokenSchema.parse({ label: ' Onasi ' })).toEqual({ label: 'Onasi' });
    expect(createParentTokenSchema.safeParse({ label: 'x'.repeat(65) }).success).toBe(false);
  });
});
