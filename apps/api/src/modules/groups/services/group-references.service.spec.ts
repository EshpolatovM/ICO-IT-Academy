import { ErrorCode } from '@lms/shared';

import { GroupReferences } from './group-references.service.js';

import type { GroupCandidatesRepository } from '../repositories/group-candidates.repository.js';
import type { LearningPathsRepository } from '../repositories/learning-paths.repository.js';

function setup({ pathExists = true, mentor = true, students = ['s1'] } = {}) {
  const paths = { exists: jest.fn().mockResolvedValue(pathExists) };
  const candidates = {
    isActiveMentor: jest.fn().mockResolvedValue(mentor),
    findStudentIds: jest.fn().mockResolvedValue(students),
  };
  return new GroupReferences(
    paths as unknown as LearningPathsRepository,
    candidates as unknown as GroupCandidatesRepository,
  );
}

describe('GroupReferences', () => {
  it("hammasi to'g'ri — xato yo'q", async () => {
    const references = setup();

    await expect(references.requirePath('p1')).resolves.toBeUndefined();
    await expect(references.requireActiveMentor('m1')).resolves.toBeUndefined();
    await expect(references.requireStudents(['s1'])).resolves.toBeUndefined();
  });

  it("yo'l yoki faol mentor yo'q — 400 maydon nomi bilan", async () => {
    const references = setup({ pathExists: false, mentor: false });

    await expect(references.requirePath('p1')).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'pathId' }],
    });
    await expect(references.requireActiveMentor('m1')).rejects.toMatchObject({
      details: [{ field: 'mentorId' }],
    });
  });

  it('topilmagan studentlar — har biri indeksi bilan', async () => {
    await expect(setup().requireStudents(['x', 's1', 'y'])).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'studentIds.0' }, { field: 'studentIds.2' }],
    });
  });
});
