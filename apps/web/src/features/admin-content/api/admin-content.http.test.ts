import { describe, expect, it } from 'vitest';

import { expectRequest, fetchCall, requestJson, setupJsonFetch } from '@/lib/testing/http';

import { adminContentHttpApi as api } from './admin-content.http';

describe('adminContentHttpApi (3.2 kontrakti, docs/12 §3)', () => {
  const fetchMock = setupJsonFetch();

  it.each([
    ['GET', '/api/v1/admin/paths', () => api.listPaths()],
    ['POST', '/api/v1/admin/paths/p1/publish', () => api.publishPath('p1')],
    ['GET', '/api/v1/admin/paths/p%201/tree', () => api.getTree('p 1')],
    ['DELETE', '/api/v1/admin/paths/p1', () => api.deletePath('p1')],
    ['DELETE', '/api/v1/admin/sections/s1', () => api.deleteSection('s1')],
    ['GET', '/api/v1/admin/lessons/l1', () => api.getLesson('l1')],
    ['DELETE', '/api/v1/admin/chests/c1', () => api.deleteChest('c1')],
  ])('%s %s', async (method, url, call) => {
    await call();
    expectRequest(fetchMock(), 0, method, url);
  });

  it.each([
    [
      '/api/v1/admin/paths/p1/sections/order',
      { sectionIds: ['a'] },
      () => api.reorderSections('p1', ['a']),
    ],
    [
      '/api/v1/admin/sections/s1/topics/order',
      { topicIds: ['a'] },
      () => api.reorderTopics('s1', ['a']),
    ],
    [
      '/api/v1/admin/topics/t1/lessons/order',
      { lessonIds: ['a'] },
      () => api.reorderLessons('t1', ['a']),
    ],
  ])("PUT %s — yangi to'liq tartib (Q-3)", async (url, body, call) => {
    await call();
    expect(requestJson(expectRequest(fetchMock(), 0, 'PUT', url))).toEqual(body);
  });

  it('PATCH /admin/lessons/:id va POST /admin/sections/:id/chests — body bilan', async () => {
    await api.updateLesson('l1', { videoUrl: null });
    await api.createChest('s1', {
      title: 'S',
      afterTopicId: 't1',
      reward: { xp: { min: 1, max: 2 }, coin: { min: 0, max: 0 } },
    });
    expect(fetchCall(fetchMock(), 0).init.method).toBe('PATCH');
    expect(requestJson(fetchCall(fetchMock(), 0).init)).toEqual({ videoUrl: null });
    expect(fetchCall(fetchMock(), 1).url).toBe('/api/v1/admin/sections/s1/chests');
  });
});
