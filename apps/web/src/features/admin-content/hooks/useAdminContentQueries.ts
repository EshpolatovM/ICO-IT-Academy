'use client';

import { useQuery } from '@tanstack/react-query';

import { adminContentApi } from '../api/admin-content.api';
import { adminContentKeys } from '../api/admin-content.query-keys';

/** `GET /admin/paths` — barcha statuslar. */
export function useAdminPaths() {
  return useQuery({
    queryKey: adminContentKeys.paths(),
    queryFn: () => adminContentApi.listPaths(),
  });
}

/** `GET /admin/paths/:id/tree` — butun daraxt bitta so'rovda. */
export function usePathTree(pathId: string) {
  return useQuery({
    queryKey: adminContentKeys.tree(pathId),
    queryFn: () => adminContentApi.getTree(pathId),
  });
}

/** `GET /admin/lessons/:id` — matn bilan. */
export function useAdminLesson(lessonId: string) {
  return useQuery({
    queryKey: adminContentKeys.lesson(lessonId),
    queryFn: () => adminContentApi.getLesson(lessonId),
  });
}
