import { ChestStatus, LessonStatus, PathNodeKind, TopicStatus } from '../types/learning-path.types';

import type {
  StudentLesson,
  StudentPathMap,
  StudentTopicDetail,
} from '../types/learning-path.types';

/** Testlar uchun kontrakt shaklidagi javoblar (3.3 §2.2). */
export const PATH_MAP_FIXTURE: StudentPathMap = {
  path: { id: 'p1', title: 'Frontend dasturchi', progress: 0.34 },
  reviewBlock: { blocked: false, dueCount: 0 },
  sections: [
    {
      id: 's1',
      title: 'HTML asoslari',
      progress: 0.5,
      nodes: [
        {
          kind: PathNodeKind.TOPIC,
          id: 't1',
          title: 'Teglar',
          icon: null,
          status: TopicStatus.COMPLETED,
          lessons: 3,
          lessonsCompleted: 3,
        },
        { kind: PathNodeKind.CHEST, id: 'c1', title: 'Sandiq', status: ChestStatus.READY },
        {
          kind: PathNodeKind.TOPIC,
          id: 't2',
          title: 'Formalar',
          icon: null,
          status: TopicStatus.AVAILABLE,
          lessons: 2,
          lessonsCompleted: 0,
        },
        {
          kind: PathNodeKind.TOPIC,
          id: 't3',
          title: 'Jadvallar',
          icon: null,
          status: TopicStatus.LOCKED,
          lessons: 2,
          lessonsCompleted: 0,
        },
      ],
    },
  ],
};

export const EMPTY_PATH_MAP: StudentPathMap = {
  path: null,
  reviewBlock: { blocked: false, dueCount: 0 },
  sections: [],
};

export const TOPIC_FIXTURE: StudentTopicDetail = {
  id: 't2',
  title: 'Formalar',
  description: 'Formalar bilan ishlash',
  icon: null,
  status: TopicStatus.IN_PROGRESS,
  section: { id: 's1', title: 'HTML asoslari' },
  skills: [{ id: 'sk1', name: 'HTML' }],
  lessons: [
    { id: 'l1', title: 'Input', estMinutes: 10, status: LessonStatus.COMPLETED },
    { id: 'l2', title: 'Label', estMinutes: 5, status: LessonStatus.AVAILABLE },
    { id: 'l3', title: 'Submit', estMinutes: 7, status: LessonStatus.LOCKED },
  ],
  lessonsCompleted: 1,
};

export const LESSON_FIXTURE: StudentLesson = {
  id: 'l2',
  title: 'Label',
  contentMd: '## Sarlavha\n\nMatn',
  videoUrl: 'https://example.com/video',
  estMinutes: 5,
  status: LessonStatus.AVAILABLE,
  topic: { id: 't2', title: 'Formalar' },
  prevLessonId: 'l1',
  nextLessonId: 'l3',
  startedAt: null,
  completedAt: null,
};
