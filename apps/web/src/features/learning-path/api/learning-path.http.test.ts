import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCall, jsonResponse, mockFetch } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';

import { learningPathHttpApi as api } from './learning-path.http';

describe('learningPathHttpApi (3.3 kontrakti)', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, {})));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['GET', '/api/v1/student/path', () => api.getPathMap()],
    ['GET', '/api/v1/student/topics/t%201', () => api.getTopic('t 1')],
    ['GET', '/api/v1/student/lessons/l1', () => api.getLesson('l1')],
    ['POST', '/api/v1/student/lessons/l1/start', () => api.startLesson('l1')],
    ['POST', '/api/v1/student/lessons/l1/complete', () => api.completeLesson('l1')],
  ])('%s %s', async (method, url, call) => {
    await call();
    const { url: actualUrl, init } = fetchCall(fetchMock, 0);
    expect(actualUrl).toBe(url);
    expect(init.method ?? 'GET').toBe(method);
  });
});
