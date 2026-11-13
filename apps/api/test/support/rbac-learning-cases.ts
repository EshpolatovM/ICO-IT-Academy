import { Role } from '@lms/shared';

import { createPublishedPath, lessonAt, topicAt } from './learning-fixtures.js';
import { OK, studentOnly } from './rbac-matrix.js';

import type { PublishedPath } from './learning-fixtures.js';
import type { EndpointCase, RequestSpec } from './rbac-matrix.js';

/**
 * 3.3 — student ilm yo'li (docs/12 §4, 3.3 §7): faqat S (o'z joriy yo'li); SA/A/M/P — 403,
 * `PASSWORD_CHANGE_REQUIRED` student — 403, anonim — 401. Har katakda yangi nashr qilingan yo'l;
 * student aktyor uning guruhiga faol a'zo qilinadi.
 */
function onStudentPath(spec: (path: PublishedPath) => RequestSpec): EndpointCase['build'] {
  return async (actor, actors) => {
    const path = await createPublishedPath(actors.content, [[1]]);
    if (actor.user?.role === Role.STUDENT) {
      await actors.newGroup({ pathId: path.pathId, studentIds: [actor.user.id] });
    }
    return spec(path);
  };
}

export const LEARNING_CASES: EndpointCase[] = [
  {
    endpoint: 'GET /student/path',
    build: onStudentPath(() => ({ method: 'get', path: '/student/path' })),
    expected: studentOnly(OK),
  },
  {
    endpoint: 'GET /student/topics/:id',
    build: onStudentPath((path) => ({
      method: 'get',
      path: `/student/topics/${topicAt(path, 0).id}`,
    })),
    expected: studentOnly(OK),
  },
  {
    endpoint: 'GET /student/lessons/:id',
    build: onStudentPath((path) => ({
      method: 'get',
      path: `/student/lessons/${lessonAt(path, 0, 0)}`,
    })),
    expected: studentOnly(OK),
  },
  {
    endpoint: 'POST /student/lessons/:id/start',
    build: onStudentPath((path) => ({
      method: 'post',
      path: `/student/lessons/${lessonAt(path, 0, 0)}/start`,
    })),
    expected: studentOnly(OK),
  },
  {
    endpoint: 'POST /student/lessons/:id/complete',
    build: onStudentPath((path) => ({
      method: 'post',
      path: `/student/lessons/${lessonAt(path, 0, 0)}/complete`,
    })),
    expected: studentOnly(OK),
  },
];
