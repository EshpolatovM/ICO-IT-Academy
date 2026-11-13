import { Injectable } from '@nestjs/common';

import { LearningPathsRepository } from '../../content/repositories/learning-paths.repository.js';
import { GroupField } from '../groups.constants.js';
import { invalidReferenceException, invalidReferencesException } from '../groups.errors.js';
import { GroupCandidatesRepository } from '../repositories/group-candidates.repository.js';

/**
 * Guruh so'rovidagi havolalarni tekshirish: yo'l mavjud va `ARCHIVED` emas (R Q-6), mentor — faol MENTOR, studentlar mavjud.
 * Noto'g'ri havola — 400 `VALIDATION_ERROR` (`details[].field` — so'rov maydoni).
 */
@Injectable()
export class GroupReferences {
  constructor(
    private readonly paths: LearningPathsRepository,
    private readonly candidates: GroupCandidatesRepository,
  ) {}

  async requirePath(pathId: string): Promise<void> {
    if (!(await this.paths.isAssignable(pathId))) {
      throw invalidReferenceException(GroupField.PATH_ID, "Yo'l topilmadi yoki arxivlangan");
    }
  }

  async requireActiveMentor(mentorId: string): Promise<void> {
    if (!(await this.candidates.isActiveMentor(mentorId))) {
      throw invalidReferenceException(GroupField.MENTOR_ID, 'Faol mentor topilmadi');
    }
  }

  /** Har bir topilmagan (yoki student bo'lmagan) id uchun alohida xato: `studentIds.<index>`. */
  async requireStudents(studentIds: readonly string[]): Promise<void> {
    const found = new Set(await this.candidates.findStudentIds(studentIds));
    const missing = studentIds.flatMap((id, index) => (found.has(id) ? [] : [index]));
    if (missing.length > 0) {
      throw invalidReferencesException(
        missing.map((index) => ({
          field: `${GroupField.STUDENT_IDS}.${String(index)}`,
          message: 'Student topilmadi',
        })),
      );
    }
  }
}
