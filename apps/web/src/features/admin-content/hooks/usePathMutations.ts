'use client';

import { adminContentApi as api } from '../api/admin-content.api';

import { useContentMutation } from './useContentMutation';

import type { CreatePathRequest, UpdatePathRequest } from '../types/admin-content-api.types';

/** `POST /admin/paths` (yangi yo'l — `DRAFT`). */
export function useCreatePath() {
  return useContentMutation((body: CreatePathRequest) => api.createPath(body));
}

/** `PATCH /admin/paths/:id` (nom, slug, tavsif, `DRAFT|ARCHIVED`). */
export function useUpdatePath(pathId: string) {
  return useContentMutation((body: UpdatePathRequest) => api.updatePath(pathId, body));
}

/** `POST /admin/paths/:id/publish` (kaskadsiz, idempotent). */
export function usePublishPath(pathId: string) {
  return useContentMutation(() => api.publishPath(pathId));
}

/** `DELETE /admin/paths/:id` (409 `PATH_IN_USE`). */
export function useDeletePath(pathId: string) {
  return useContentMutation(() => api.deletePath(pathId));
}
