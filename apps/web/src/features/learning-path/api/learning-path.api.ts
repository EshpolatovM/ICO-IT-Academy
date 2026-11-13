import { learningPathMockApi } from './learning-path.mock';

import type { LearningPathApi } from '../types/learning-path.types';

/**
 * Feature'ning yagona API kirish nuqtasi. Backend (3.3) tayyor bo'lgach shu yerda
 * `learningPathMockApi` → `learningPathHttpApi` (`./learning-path.http`) ga almashtiriladi.
 */
export const learningPathApi: LearningPathApi = learningPathMockApi;
