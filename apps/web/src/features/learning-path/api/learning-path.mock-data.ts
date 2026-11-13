import { LessonStatus } from '../types/learning-path.types';

import type { SkillRef } from '../types/learning-path.types';

/*
 * Soxta (mock) ilm yo'li — backend (3.3) tayyor bo'lguncha. Faqat ko'rinadigan (PUBLISHED)
 * kontent: student API shuni qaytaradi (Q-1).
 */

export interface MockLesson {
  id: string;
  title: string;
  estMinutes: number;
  videoUrl: string | null;
  contentMd: string;
}

export interface MockChest {
  id: string;
  title: string;
}

export interface MockTopic {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  skills: SkillRef[];
  lessons: MockLesson[];
  /** Shu mavzudan keyin turadigan sandiq (`after_topic`). */
  chestAfter: MockChest | null;
}

export interface MockSection {
  id: string;
  title: string;
  topics: MockTopic[];
}

export interface MockPath {
  id: string;
  title: string;
  sections: MockSection[];
}

export interface MockLessonProgress {
  status: typeof LessonStatus.IN_PROGRESS | typeof LessonStatus.COMPLETED;
  startedAt: string;
  completedAt: string | null;
}

const DEFAULT_EST_MINUTES = 10;
const DEMO_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const DEMO_STARTED_AT = '2026-11-10T09:00:00.000Z';
const DEMO_COMPLETED_AT = '2026-11-10T09:20:00.000Z';

function lessonContent(title: string): string {
  return [
    `## ${title}`,
    '',
    "Bu soxta dars matni. Backend tayyor bo'lgach haqiqiy kontent keladi.",
    '',
    '- birinchi band\n- ikkinchi band',
    '',
    '```html\n<p>Salom, dunyo!</p>\n```',
  ].join('\n');
}

function lesson(id: string, title: string, videoUrl: string | null = null): MockLesson {
  return { id, title, estMinutes: DEFAULT_EST_MINUTES, videoUrl, contentMd: lessonContent(title) };
}

function topic(
  id: string,
  title: string,
  lessons: MockLesson[],
  chestAfter: MockChest | null = null,
): MockTopic {
  return {
    id,
    title,
    description: `${title} mavzusi bo'yicha darslar.`,
    icon: null,
    skills: [],
    lessons,
    chestAfter,
  };
}

export const MOCK_PATH: MockPath = {
  id: 'path-frontend',
  title: 'Frontend dasturchi',
  sections: [
    {
      id: 'section-html',
      title: 'HTML asoslari',
      topics: [
        topic(
          'topic-html-tags',
          'Teglar',
          [
            lesson('lesson-tags-intro', 'Teg nima?', DEMO_VIDEO_URL),
            lesson('lesson-tags-text', 'Matn teglari'),
          ],
          { id: 'chest-html-1', title: 'Sandiq' },
        ),
        topic('topic-html-forms', 'Formalar', [
          lesson('lesson-forms-input', 'Input va label'),
          lesson('lesson-forms-submit', 'Formani yuborish'),
        ]),
      ],
    },
    {
      id: 'section-css',
      title: 'CSS asoslari',
      topics: [
        topic(
          'topic-css-selectors',
          'Selektorlar',
          [lesson('lesson-css-selectors', 'Oddiy selektorlar')],
          { id: 'chest-css-1', title: 'Katta sandiq' },
        ),
      ],
    },
  ],
};

/** Boshlang'ich progress: birinchi mavzuning 1-darsi tugagan, 2-darsi jarayonda. */
export function initialMockProgress(): Map<string, MockLessonProgress> {
  return new Map<string, MockLessonProgress>([
    [
      'lesson-tags-intro',
      {
        status: LessonStatus.COMPLETED,
        startedAt: DEMO_STARTED_AT,
        completedAt: DEMO_COMPLETED_AT,
      },
    ],
    [
      'lesson-tags-text',
      { status: LessonStatus.IN_PROGRESS, startedAt: DEMO_STARTED_AT, completedAt: null },
    ],
  ]);
}
