import type {
  MentorGroupItem,
  MentorGroupStudent,
  MentorStudentProfile,
  ParentTokenCreatedResponse,
  ParentTokenSummary,
} from '@lms/shared';

/** Testlar uchun namunaviy ma'lumotlar (docs/12 §12 va §2.1 javob shakllari). */
export const IDS = {
  group: '0190b000-0000-7000-8000-000000000001',
  path: '0190b000-0000-7000-8000-000000000002',
  student: '0190b000-0000-7000-8000-000000000003',
  token: '0190b000-0000-7000-8000-000000000004',
  newToken: '0190b000-0000-7000-8000-000000000005',
} as const;

export const API = {
  groups: '/api/v1/mentor/groups',
  group: `/api/v1/mentor/groups/${IDS.group}`,
  groupStudents: `/api/v1/mentor/groups/${IDS.group}/students`,
  student: `/api/v1/mentor/students/${IDS.student}`,
  resetPassword: `/api/v1/students/${IDS.student}/reset-password`,
  tokens: `/api/v1/students/${IDS.student}/parent-tokens`,
  token: `/api/v1/students/${IDS.student}/parent-tokens/${IDS.token}`,
} as const;

export const GROUP_FIXTURE: MentorGroupItem = {
  id: IDS.group,
  name: 'FE-12',
  status: 'ACTIVE',
  startsAt: '2026-12-01',
  path: { id: IDS.path, title: 'Frontend dasturchi' },
  studentsCount: 24,
};

export const GROUP_STUDENT_FIXTURE: MentorGroupStudent = {
  id: IDS.student,
  studentCode: 'ST-10245',
  firstName: 'Ali',
  lastName: 'Valiyev',
  status: 'ACTIVE',
  lastLoginAt: '2026-11-10T06:12:00.000Z',
};

export const STUDENT_FIXTURE: MentorStudentProfile = {
  ...GROUP_STUDENT_FIXTURE,
  group: { id: IDS.group, name: 'FE-12' },
  parentTokensCount: 1,
};

export const TOKEN_FIXTURE: ParentTokenSummary = {
  id: IDS.token,
  prefix: 'k2Jd8x',
  label: 'Onasi',
  createdAt: '2026-11-10T08:00:00.000Z',
  lastUsedAt: null,
  useCount: 0,
  expiresAt: null,
};

/** Yaratish/qayta yaratish javobi — `token` va `link` faqat shu yerda. */
export function createdToken(token: string, label: string | null): ParentTokenCreatedResponse {
  return {
    id: IDS.newToken,
    token,
    link: `https://app.example.uz/parent#t=${token}`,
    prefix: token.slice(0, TOKEN_FIXTURE.prefix.length),
    label,
    createdAt: '2026-11-11T08:00:00.000Z',
  };
}
