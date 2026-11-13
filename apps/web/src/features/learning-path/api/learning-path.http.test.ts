import { describe, it } from 'vitest';

import { expectRequest, setupJsonFetch } from '@/lib/testing/http';

import { learningPathHttpApi as api } from './learning-path.http';

describe('learningPathHttpApi (3.3 kontrakti)', () => {
  const fetchMock = setupJsonFetch();

  it.each([
    ['GET', '/api/v1/student/path', () => api.getPathMap()],
    ['GET', '/api/v1/student/topics/t%201', () => api.getTopic('t 1')],
    ['GET', '/api/v1/student/lessons/l1', () => api.getLesson('l1')],
    ['POST', '/api/v1/student/lessons/l1/start', () => api.startLesson('l1')],
    ['POST', '/api/v1/student/lessons/l1/complete', () => api.completeLesson('l1')],
  ])('%s %s', async (method, url, call) => {
    await call();
    expectRequest(fetchMock(), 0, method, url);
  });
});
