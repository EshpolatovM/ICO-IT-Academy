import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api';

import { addMembersErrorText, GROUP_ARCHIVED_MESSAGE, mentorErrorText } from './group-errors';

const SELECTED = [
  { value: 'a', label: 'Ali Valiyev' },
  { value: 'b', label: 'Laylo Karimova' },
];

function apiError(status: number, code: ApiError['code'], details: unknown = null): ApiError {
  return new ApiError({ status, code, message: 'Server xabari', details });
}

describe('addMembersErrorText', () => {
  it('409 STUDENT_ALREADY_IN_GROUP — studentlar nomi bilan', () => {
    const error = apiError(409, 'STUDENT_ALREADY_IN_GROUP', { studentIds: ['b'] });
    expect(addMembersErrorText(error, SELECTED)).toBe(
      'Allaqachon boshqa faol guruhda: Laylo Karimova',
    );
  });

  it("409 STUDENT_ALREADY_IN_GROUP details'siz — server xabari", () => {
    expect(addMembersErrorText(apiError(409, 'STUDENT_ALREADY_IN_GROUP'), SELECTED)).toBe(
      'Server xabari',
    );
  });

  it('409 GROUP_ARCHIVED', () => {
    expect(addMembersErrorText(apiError(409, 'GROUP_ARCHIVED'), SELECTED)).toBe(
      GROUP_ARCHIVED_MESSAGE,
    );
  });

  it("400 studentIds.<i> — tartib bo'yicha student nomi bilan", () => {
    const error = apiError(400, 'VALIDATION_ERROR', [
      { field: 'studentIds.1', message: 'Student topilmadi' },
    ]);
    expect(addMembersErrorText(error, SELECTED)).toBe('Laylo Karimova: Student topilmadi');
  });

  it('API xatosi emas — umumiy matn', () => {
    expect(addMembersErrorText(new Error('x'), SELECTED)).not.toBe('x');
  });
});

describe('mentorErrorText', () => {
  it('400 mentorId maydon xabari', () => {
    const error = apiError(400, 'VALIDATION_ERROR', [
      { field: 'mentorId', message: 'Faol mentor emas' },
    ]);
    expect(mentorErrorText(error)).toBe('Faol mentor emas');
  });

  it('boshqa xato — server xabari', () => {
    expect(mentorErrorText(apiError(403, 'FORBIDDEN'))).toBe('Server xabari');
  });
});
