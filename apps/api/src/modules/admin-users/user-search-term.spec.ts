import { Role } from '@lms/shared';

import { buildUserSearchTerm } from './user-search-term.js';

describe('buildUserSearchTerm', () => {
  it("q bo'lmasa — null", () => {
    expect(buildUserSearchTerm(undefined, Role.STUDENT)).toBeNull();
  });

  it('student: ism naqshi kichik harfda, ST- kodi va raqam → aniq kod', () => {
    expect(buildUserSearchTerm('Ali V', Role.STUDENT)).toEqual({
      namePattern: '%ali v%',
      studentCode: null,
      phonePattern: null,
    });
    expect(buildUserSearchTerm('st-10245', Role.STUDENT)?.studentCode).toBe('ST-10245');
    expect(buildUserSearchTerm('10245', Role.STUDENT)?.studentCode).toBe('ST-10245');
  });

  it('LIKE maxsus belgilari ekranlanadi', () => {
    expect(buildUserSearchTerm('50%_a\\b', Role.MENTOR)?.namePattern).toBe('%50\\%\\_a\\\\b%');
  });

  it("xodim: telefonga o'xshash satr → raqamlar naqshi, student kodi yo'q", () => {
    expect(buildUserSearchTerm('+998 90 12', Role.ADMIN)).toEqual({
      namePattern: '%+998 90 12%',
      studentCode: null,
      phonePattern: '%9989012%',
    });
    expect(buildUserSearchTerm('Vali', Role.MENTOR)?.phonePattern).toBeNull();
  });
});
