import { ContentStatus } from '@lms/shared';

import type { AdminChestNode, AdminPathDetail } from '../types/admin-content.types';

/*
 * Soxta API (3.2 backend tayyor bo'lguncha) uchun xotiradagi "baza" va boshlang'ich ma'lumot.
 * Qiymatlar faqat sinov uchun (S-B5: haqiqiy seed sandig'i qiymatlarini egasi tasdiqlaydi).
 */

export type MockPath = AdminPathDetail;

export interface MockSection {
  id: string;
  pathId: string;
  order: number;
  title: string;
  description: string | null;
  status: ContentStatus;
}

export interface MockTopic {
  id: string;
  sectionId: string;
  order: number;
  title: string;
  description: string | null;
  icon: string | null;
  status: ContentStatus;
}

export interface MockLesson {
  id: string;
  topicId: string;
  order: number;
  title: string;
  contentMd: string;
  videoUrl: string | null;
  estMinutes: number | null;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MockChest extends AdminChestNode {
  sectionId: string;
}

export interface MockContentDb {
  paths: MockPath[];
  sections: MockSection[];
  topics: MockTopic[];
  lessons: MockLesson[];
  chests: MockChest[];
  /** Studentlar progressi bor darslar (`HAS_PROGRESS` / `PATH_IN_USE` holatlari uchun). */
  progressLessonIds: string[];
}

const SEED_TIME = '2026-11-01T09:00:00.000Z';
const { DRAFT, PUBLISHED } = ContentStatus;

function seedPaths(): MockPath[] {
  const base = { createdAt: SEED_TIME, updatedAt: SEED_TIME };
  return [
    {
      ...base,
      id: 'path-frontend',
      title: 'Frontend dasturchi',
      slug: 'frontend',
      description: 'HTML, CSS va JavaScript',
      status: PUBLISHED,
      groupsCount: 1,
    },
    {
      ...base,
      id: 'path-python',
      title: 'Python asoslari',
      slug: 'python',
      description: null,
      status: DRAFT,
      groupsCount: 0,
    },
  ];
}

function seedSections(): MockSection[] {
  const base = { pathId: 'path-frontend', description: null };
  return [
    { ...base, id: 'section-html', order: 1, title: 'HTML asoslari', status: PUBLISHED },
    { ...base, id: 'section-css', order: 2, title: 'CSS', status: DRAFT },
  ];
}

function seedTopics(): MockTopic[] {
  const base = { description: null, icon: null };
  return [
    {
      ...base,
      id: 'topic-html-tags',
      sectionId: 'section-html',
      order: 1,
      title: 'HTML teglari',
      status: PUBLISHED,
    },
    {
      ...base,
      id: 'topic-html-forms',
      sectionId: 'section-html',
      order: 2,
      title: 'Formalar',
      status: DRAFT,
    },
    {
      ...base,
      id: 'topic-css-selectors',
      sectionId: 'section-css',
      order: 1,
      title: 'Selektorlar',
      status: DRAFT,
    },
  ];
}

function seedLesson(id: string, topicId: string, title: string): MockLesson {
  return {
    id,
    topicId,
    order: 1,
    title,
    contentMd: `# ${title}\n\nDars matni.`,
    videoUrl: null,
    estMinutes: null,
    status: DRAFT,
    createdAt: SEED_TIME,
    updatedAt: SEED_TIME,
  };
}

function seedLessons(): MockLesson[] {
  return [
    {
      ...seedLesson('lesson-tags-intro', 'topic-html-tags', 'Teglar bilan tanishuv'),
      status: PUBLISHED,
    },
    {
      ...seedLesson('lesson-tags-text', 'topic-html-tags', 'Matn teglari'),
      order: 2,
      status: PUBLISHED,
    },
    seedLesson('lesson-forms-input', 'topic-html-forms', 'Input maydonlari'),
    seedLesson('lesson-css-basics', 'topic-css-selectors', 'Selektor turlari'),
  ];
}

const SEED_CHEST_XP = 50;
const SEED_CHEST_COIN = 30;

export function initialMockContentDb(): MockContentDb {
  return {
    paths: seedPaths(),
    sections: seedSections(),
    topics: seedTopics(),
    lessons: seedLessons(),
    chests: [
      {
        id: 'chest-html-1',
        sectionId: 'section-html',
        title: "HTML sandig'i",
        afterTopicId: 'topic-html-tags',
        reward: {
          xp: { min: SEED_CHEST_XP, max: SEED_CHEST_XP },
          coin: { min: SEED_CHEST_COIN, max: SEED_CHEST_COIN },
        },
      },
    ],
    progressLessonIds: ['lesson-tags-intro'],
  };
}
