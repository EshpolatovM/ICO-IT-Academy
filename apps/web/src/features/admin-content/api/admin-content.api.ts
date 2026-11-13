import { adminContentMockApi } from './admin-content.mock';

import type { AdminContentApi } from '../types/admin-content-api.types';

/**
 * Feature'ning yagona API kirish nuqtasi. Backend (3.2) tayyor bo'lgach shu yerda
 * `adminContentMockApi` → `adminContentHttpApi` (`./admin-content.http`) ga almashtiriladi.
 */
export const adminContentApi: AdminContentApi = adminContentMockApi;
