import { HttpStatus } from '@nestjs/common';

import { TEST_REWARD, uniqueSuffix } from './content-fixtures.js';
import { adminsOnly, contentReaders, CREATED, OK, ok, resolved } from './rbac-matrix.js';

import type { ContentFixtures, TestTree } from './content-fixtures.js';
import type { EndpointCase, RequestSpec } from './rbac-matrix.js';

/**
 * 3.2 — ilm yo'li kontenti (docs/12 §3, 3.2 §6): yozish — SA A; `GET /admin/paths` va `/tree` —
 * M ham (faqat o'qish); `GET /admin/paths/:id`, `/admin/lessons/:id`, `/admin/skills` — M uchun yopiq
 * (S-C1). Student va ota-ona — 403, anonim — 401. Har katak o'z daraxti bilan ishlaydi.
 */

const NO_CONTENT = ok(HttpStatus.NO_CONTENT);

type TreeSpec = (tree: TestTree, content: ContentFixtures) => RequestSpec | Promise<RequestSpec>;

/** Har katak uchun yangi daraxt (yo'l → bo'lim → 3 mavzu → dars). */
function withTree(spec: TreeSpec): EndpointCase['build'] {
  return async (_actor, actors) => spec(await actors.content.createTree(), actors.content);
}

const PATH_CASES: EndpointCase[] = [
  {
    endpoint: 'GET /admin/paths?status=DRAFT',
    build: resolved({ method: 'get', path: '/admin/paths?status=DRAFT' }),
    expected: contentReaders(OK),
  },
  {
    endpoint: 'POST /admin/paths',
    build: () =>
      Promise.resolve({
        method: 'post',
        path: '/admin/paths',
        body: { title: 'E2E Rbac', slug: `e2e-rbac-${uniqueSuffix()}` },
      }),
    expected: adminsOnly(CREATED),
    createsContent: 'path',
  },
  {
    endpoint: 'GET /admin/paths/:id',
    build: withTree((tree) => ({ method: 'get', path: `/admin/paths/${tree.pathId}` })),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'PATCH /admin/paths/:id',
    build: withTree((tree) => ({
      method: 'patch',
      path: `/admin/paths/${tree.pathId}`,
      body: { title: 'E2E Rbac 2' },
    })),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'DELETE /admin/paths/:id',
    build: withTree((tree) => ({ method: 'delete', path: `/admin/paths/${tree.pathId}` })),
    expected: adminsOnly(NO_CONTENT),
  },
  {
    endpoint: 'POST /admin/paths/:id/publish',
    build: withTree((tree) => ({ method: 'post', path: `/admin/paths/${tree.pathId}/publish` })),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'GET /admin/paths/:id/tree',
    build: withTree((tree) => ({ method: 'get', path: `/admin/paths/${tree.pathId}/tree` })),
    expected: contentReaders(OK),
  },
  {
    endpoint: 'POST /admin/paths/:id/sections',
    build: withTree((tree) => ({
      method: 'post',
      path: `/admin/paths/${tree.pathId}/sections`,
      body: { title: "E2E bo'lim" },
    })),
    expected: adminsOnly(CREATED),
  },
  {
    endpoint: 'PUT /admin/paths/:id/sections/order',
    build: withTree((tree) => ({
      method: 'put',
      path: `/admin/paths/${tree.pathId}/sections/order`,
      body: { sectionIds: [tree.sectionId] },
    })),
    expected: adminsOnly(NO_CONTENT),
  },
];

const SECTION_TOPIC_CASES: EndpointCase[] = [
  {
    endpoint: 'PATCH /admin/sections/:id',
    build: withTree((tree) => ({
      method: 'patch',
      path: `/admin/sections/${tree.sectionId}`,
      body: { title: "E2E bo'lim 2" },
    })),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'DELETE /admin/sections/:id',
    build: withTree((tree) => ({ method: 'delete', path: `/admin/sections/${tree.sectionId}` })),
    expected: adminsOnly(NO_CONTENT),
  },
  {
    endpoint: 'POST /admin/sections/:id/topics',
    build: withTree((tree) => ({
      method: 'post',
      path: `/admin/sections/${tree.sectionId}/topics`,
      body: { title: 'E2E mavzu' },
    })),
    expected: adminsOnly(CREATED),
  },
  {
    endpoint: 'PUT /admin/sections/:id/topics/order',
    build: withTree((tree) => ({
      method: 'put',
      path: `/admin/sections/${tree.sectionId}/topics/order`,
      body: { topicIds: [...tree.topicIds].reverse() },
    })),
    expected: adminsOnly(NO_CONTENT),
  },
  {
    endpoint: 'POST /admin/sections/:id/chests',
    build: withTree((tree) => ({
      method: 'post',
      path: `/admin/sections/${tree.sectionId}/chests`,
      body: { title: 'E2E sandiq', afterTopicId: tree.topicIds[0], reward: TEST_REWARD },
    })),
    expected: adminsOnly(CREATED),
  },
  {
    endpoint: 'PATCH /admin/topics/:id',
    build: withTree((tree) => ({
      method: 'patch',
      path: `/admin/topics/${tree.topicIds[0]}`,
      body: { icon: 'html' },
    })),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'DELETE /admin/topics/:id',
    build: withTree((tree) => ({ method: 'delete', path: `/admin/topics/${tree.topicIds[0]}` })),
    expected: adminsOnly(NO_CONTENT),
  },
  {
    endpoint: 'POST /admin/topics/:id/lessons',
    build: withTree((tree) => ({
      method: 'post',
      path: `/admin/topics/${tree.topicIds[0]}/lessons`,
      body: { title: 'E2E dars' },
    })),
    expected: adminsOnly(CREATED),
  },
  {
    endpoint: 'PUT /admin/topics/:id/lessons/order',
    build: withTree((tree) => ({
      method: 'put',
      path: `/admin/topics/${tree.topicIds[0]}/lessons/order`,
      body: { lessonIds: [tree.lessonIds[0]] },
    })),
    expected: adminsOnly(NO_CONTENT),
  },
  {
    endpoint: 'PUT /admin/topics/:id/skills',
    build: withTree(async (tree, content) => ({
      method: 'put',
      path: `/admin/topics/${tree.topicIds[0]}/skills`,
      body: { skillIds: [(await content.createSkill()).id] },
    })),
    expected: adminsOnly(OK),
  },
];

const LESSON_CHEST_SKILL_CASES: EndpointCase[] = [
  {
    endpoint: 'GET /admin/lessons/:id',
    build: withTree((tree) => ({ method: 'get', path: `/admin/lessons/${tree.lessonIds[0]}` })),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'PATCH /admin/lessons/:id',
    build: withTree((tree) => ({
      method: 'patch',
      path: `/admin/lessons/${tree.lessonIds[0]}`,
      body: { contentMd: '# Salom' },
    })),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'DELETE /admin/lessons/:id',
    build: withTree((tree) => ({ method: 'delete', path: `/admin/lessons/${tree.lessonIds[0]}` })),
    expected: adminsOnly(NO_CONTENT),
  },
  {
    endpoint: 'PATCH /admin/chests/:id',
    build: withTree(async (tree, content) => ({
      method: 'patch',
      path: `/admin/chests/${await content.createChest(tree.sectionId, tree.topicIds[0])}`,
      body: { title: 'E2E sandiq 2' },
    })),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'DELETE /admin/chests/:id',
    build: withTree(async (tree, content) => ({
      method: 'delete',
      path: `/admin/chests/${await content.createChest(tree.sectionId, tree.topicIds[0])}`,
    })),
    expected: adminsOnly(NO_CONTENT),
  },
  {
    endpoint: 'GET /admin/skills',
    build: resolved({ method: 'get', path: '/admin/skills' }),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'POST /admin/skills',
    build: () =>
      Promise.resolve({
        method: 'post',
        path: '/admin/skills',
        body: { name: `E2E-${uniqueSuffix()}` },
      }),
    expected: adminsOnly(CREATED),
    createsContent: 'skill',
  },
  {
    endpoint: 'PATCH /admin/skills/:id',
    build: async (_actor, actors) => ({
      method: 'patch',
      path: `/admin/skills/${(await actors.content.createSkill()).id}`,
      body: { icon: 'star' },
    }),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'DELETE /admin/skills/:id',
    build: async (_actor, actors) => ({
      method: 'delete',
      path: `/admin/skills/${(await actors.content.createSkill()).id}`,
    }),
    expected: adminsOnly(NO_CONTENT),
  },
];

export const CONTENT_CASES: EndpointCase[] = [
  ...PATH_CASES,
  ...SECTION_TOPIC_CASES,
  ...LESSON_CHEST_SKILL_CASES,
];
