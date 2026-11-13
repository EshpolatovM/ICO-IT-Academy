import type { ChestReward, ContentStatus } from '@lms/shared';

/** Repository'dan chiqadigan yozuvlar (Prisma tiplari tashqariga chiqmaydi). */

export interface PathItemRecord {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  description: string | null;
  updatedAt: Date;
  sectionsCount: number;
  topicsCount: number;
}

export interface PathRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
  /** O'chirilmagan guruhlar soni. */
  groupsCount: number;
}

export interface NewPathData {
  title: string;
  slug: string;
  description: string | null;
}

/** Kaskadli nashrda `DRAFT → PUBLISHED` bo'lgan bolalar soni. */
export interface PublishedCounts {
  sections: number;
  topics: number;
  lessons: number;
}

/** Yo'l ishlatilishi: o'chirilmagan guruhlar soni va o'chirishni to'sadigan bog'lanish bormi. */
export interface PathUsage {
  groupsCount: number;
  inUse: boolean;
}

/** Bo'lim/mavzu/dars umumiy qismi: ota (`parentId`) va yo'l (`pathId`, kesh versiyasi uchun). */
export interface ContentNodeRecord {
  id: string;
  parentId: string;
  pathId: string;
  title: string;
  status: ContentStatus;
}

export interface SectionRecord extends ContentNodeRecord {
  description: string | null;
}

export interface TopicRecord extends ContentNodeRecord {
  description: string | null;
  icon: string | null;
}

export interface LessonRecord extends ContentNodeRecord {
  contentMd: string;
  videoUrl: string | null;
  estMinutes: number | null;
}

export interface SectionChanges {
  title?: string;
  description?: string | null;
  status?: ContentStatus;
}

export interface TopicChanges extends SectionChanges {
  icon?: string | null;
}

export interface LessonChanges {
  title?: string;
  contentMd?: string;
  videoUrl?: string | null;
  estMinutes?: number | null;
  status?: ContentStatus;
}

/** Yangi bo'lim/mavzu/dars: ota, tartib (oxiriga) va maydonlar; holat — `DRAFT`. */
export interface NewNodeData<TFields> {
  parentId: string;
  order: number;
  fields: TFields;
}

export interface SectionFields {
  title: string;
  description: string | null;
}

export interface TopicFields extends SectionFields {
  icon: string | null;
}

export interface LessonFields {
  title: string;
  contentMd: string;
  videoUrl: string | null;
  estMinutes: number | null;
}

/** `GET /admin/lessons/:id` uchun to'liq dars. */
export interface LessonDetailRecord extends LessonRecord {
  order: number;
  createdAt: Date;
  updatedAt: Date;
  topic: { id: string; title: string };
  path: { id: string; title: string };
}

export interface ChestRecord {
  id: string;
  sectionId: string;
  pathId: string;
  afterTopicId: string;
  title: string;
  reward: ChestReward;
}

export interface NewChestData {
  sectionId: string;
  afterTopicId: string;
  title: string;
  reward: ChestReward;
}

export interface ChestChanges {
  title?: string;
  afterTopicId?: string;
  reward?: ChestReward;
}

export interface SkillRecord {
  id: string;
  name: string;
  icon: string | null;
  topicsCount: number;
}

export interface SkillSearchCriteria {
  q?: string;
  page: number;
  pageSize: number;
}
