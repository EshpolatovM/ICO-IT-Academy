import { fromDateOnly, toDateOnly } from '../mappers/group.mapper.js';

import type { AuditSnapshot } from '../../audit/audit.types.js';
import type { UpdateGroupDto } from '../dto/groups.dto.js';
import type { GroupChanges, GroupRecord } from '../groups.types.js';

/** Audit uchun ko'rinish: sana — `YYYY-MM-DD`. */
type GroupSnapshot = Record<'name' | 'status' | 'startsAt', string | null>;

function snapshotOf(record: Pick<GroupRecord, 'name' | 'status' | 'startsAt'>): GroupSnapshot {
  return { name: record.name, status: record.status, startsAt: toDateOnly(record.startsAt) };
}

/** Faqat haqiqatan o'zgargan maydonlar (bir xil qiymat — o'zgarish emas, audit yozilmaydi). */
export function diffGroupChanges(target: GroupRecord, request: UpdateGroupDto): GroupChanges {
  const diff: GroupChanges = {};
  if (request.name !== undefined && request.name !== target.name) {
    diff.name = request.name;
  }
  if (request.status !== undefined && request.status !== target.status) {
    diff.status = request.status;
  }
  if (request.startsAt !== undefined && request.startsAt !== toDateOnly(target.startsAt)) {
    diff.startsAt = fromDateOnly(request.startsAt);
  }
  return diff;
}

/** O'zgargan maydonlarning oldingi va keyingi qiymatlari (`GROUP_UPDATED` auditi). */
export function groupChangeSnapshots(
  target: GroupRecord,
  diff: GroupChanges,
): { before: AuditSnapshot; after: AuditSnapshot } {
  const before = snapshotOf(target);
  const after = snapshotOf({ ...target, ...diff });
  const fields = (Object.keys(diff) as (keyof GroupChanges)[]).filter(
    (field) => diff[field] !== undefined,
  );
  return {
    before: Object.fromEntries(fields.map((field) => [field, before[field]])),
    after: Object.fromEntries(fields.map((field) => [field, after[field]])),
  };
}

/** `GROUP_CREATED` auditi uchun yangi guruh holati. */
export function newGroupSnapshot(
  data: Pick<GroupRecord, 'name' | 'status' | 'startsAt'> & {
    pathId: string;
    mentorId: string | null;
  },
): AuditSnapshot {
  return { ...snapshotOf(data), pathId: data.pathId, mentorId: data.mentorId };
}
