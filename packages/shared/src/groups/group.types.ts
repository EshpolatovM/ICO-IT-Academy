import type { ContentStatus } from '../enums/content-status.js';
import type { GroupStatus } from '../enums/group-status.js';
import type { UserStatus } from '../enums/user-status.js';

/** Guruhga qisqa havola (ro'yxat va tafsilotlarda: mentor guruhlari, studentning faol guruhi). */
export interface GroupRef {
  id: string;
  name: string;
}

/** Guruh o'qiydigan yo'lga qisqa havola. */
export interface GroupPathRef {
  id: string;
  title: string;
}

/** Guruh mentori (ism-familiya). */
export interface GroupMentorRef {
  id: string;
  firstName: string;
  lastName: string;
}

/** `GET /admin/paths` elementi — guruh formasi uchun (to'liq kontent CRUD — 3-bosqich). */
export interface LearningPathListItem {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
}

/** `GET /admin/paths` — 200. */
export interface LearningPathsResponse {
  items: LearningPathListItem[];
}

/** `GET /admin/groups` elementi. `startsAt` — `YYYY-MM-DD`, `membersCount` — faol a'zolar soni. */
export interface AdminGroupListItem {
  id: string;
  name: string;
  status: GroupStatus;
  startsAt: string | null;
  createdAt: string;
  path: GroupPathRef;
  mentor: GroupMentorRef | null;
  membersCount: number;
}

/** Guruhning faol a'zosi (`joinedAt` — ISO-8601). */
export interface AdminGroupMember {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  joinedAt: string;
}

/** `GET/PATCH /admin/groups/:id`, `POST /admin/groups`, `PUT .../mentor`, `POST .../members`. */
export interface AdminGroupDetail extends AdminGroupListItem {
  members: AdminGroupMember[];
}

/** `GET /mentor/groups` elementi va `GET /mentor/groups/:id` (faqat o'z ACTIVE guruhlari). */
export interface MentorGroupItem {
  id: string;
  name: string;
  status: GroupStatus;
  startsAt: string | null;
  path: GroupPathRef;
  studentsCount: number;
}

/** `GET /mentor/groups` — 200. */
export interface MentorGroupsResponse {
  items: MentorGroupItem[];
}

/** `GET /mentor/groups/:id/students` elementi. */
export interface MentorGroupStudent {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  lastLoginAt: string | null;
}

/** `GET /mentor/groups/:id/students` — 200. */
export interface MentorGroupStudentsResponse {
  items: MentorGroupStudent[];
}

/** `GET /mentor/students/:id` — 200. `parentTokensCount` — faol ota-ona tokenlari soni. */
export interface MentorStudentProfile extends MentorGroupStudent {
  group: GroupRef | null;
  parentTokensCount: number;
}
