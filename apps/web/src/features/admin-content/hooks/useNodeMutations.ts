'use client';

import { adminContentApi as api } from '../api/admin-content.api';

import { useContentMutation } from './useContentMutation';

import type {
  CreateChestRequest,
  CreateLessonRequest,
  CreateSectionRequest,
  CreateTopicRequest,
  UpdateChestRequest,
  UpdateLessonRequest,
  UpdateSectionRequest,
  UpdateTopicRequest,
} from '../types/admin-content-api.types';

/** Daraxt tugunlari (bo'lim, mavzu, dars, sandiq) mutatsiyalari — docs/tasks/03-3.2 §2.1. */

export function useCreateSection(pathId: string) {
  return useContentMutation((body: CreateSectionRequest) => api.createSection(pathId, body));
}

export function useUpdateSection(sectionId: string) {
  return useContentMutation((body: UpdateSectionRequest) => api.updateSection(sectionId, body));
}

export function useDeleteSection(sectionId: string) {
  return useContentMutation(() => api.deleteSection(sectionId));
}

export function useCreateTopic(sectionId: string) {
  return useContentMutation((body: CreateTopicRequest) => api.createTopic(sectionId, body));
}

export function useUpdateTopic(topicId: string) {
  return useContentMutation((body: UpdateTopicRequest) => api.updateTopic(topicId, body));
}

export function useDeleteTopic(topicId: string) {
  return useContentMutation(() => api.deleteTopic(topicId));
}

export function useCreateLesson(topicId: string) {
  return useContentMutation((body: CreateLessonRequest) => api.createLesson(topicId, body));
}

export function useUpdateLesson(lessonId: string) {
  return useContentMutation((body: UpdateLessonRequest) => api.updateLesson(lessonId, body));
}

export function useDeleteLesson(lessonId: string) {
  return useContentMutation(() => api.deleteLesson(lessonId));
}

export function useCreateChest(sectionId: string) {
  return useContentMutation((body: CreateChestRequest) => api.createChest(sectionId, body));
}

export function useUpdateChest(chestId: string) {
  return useContentMutation((body: UpdateChestRequest) => api.updateChest(chestId, body));
}

export function useDeleteChest(chestId: string) {
  return useContentMutation(() => api.deleteChest(chestId));
}
