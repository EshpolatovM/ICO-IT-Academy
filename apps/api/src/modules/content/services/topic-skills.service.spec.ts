import { AuditAction, ErrorCode } from '@lms/shared';

import { ForeignKeyViolationError } from '../../../common/exceptions/constraint-violation.error.js';
import { ACTOR, fakeKit } from '../testing/content.fixtures.js';

import { TopicSkillsService } from './topic-skills.service.js';

import type { SkillsRepository } from '../repositories/skills.repository.js';
import type { TopicSkillsRepository } from '../repositories/topic-skills.repository.js';
import type { TopicsRepository } from '../repositories/topics.repository.js';

const REFS = [{ id: 'k1', name: 'HTML', icon: null }];

function setup(before = ['k1']) {
  const topics = { lockRecord: jest.fn().mockResolvedValue({ id: 't1', pathId: 'p1' }) };
  const skills = {
    findExistingIds: jest.fn((ids: string[]) => Promise.resolve(ids.filter((id) => id !== 'x'))),
  };
  const topicSkills = {
    listSkillIds: jest.fn().mockResolvedValue(before),
    replace: jest.fn().mockResolvedValue(undefined),
    listRefs: jest.fn().mockResolvedValue(REFS),
  };
  const fakes = fakeKit();
  const service = new TopicSkillsService(
    topics as unknown as TopicsRepository,
    skills as unknown as SkillsRepository,
    topicSkills as unknown as TopicSkillsRepository,
    fakes.kit,
  );
  return { service, topics, topicSkills, ...fakes };
}

describe('TopicSkillsService', () => {
  it("noma'lum ko'nikma — 400 `skillIds.<i>` (har biri indeksi bilan)", async () => {
    const { service, topicSkills } = setup();

    await expect(service.set('t1', ['x', 'k1', 'x'], ACTOR)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'skillIds.0' }, { field: 'skillIds.2' }],
    });
    expect(topicSkills.replace).not.toHaveBeenCalled();
  });

  it("bo'sh ro'yxat — hammasi olib tashlanadi, audit, versiya", async () => {
    const { service, topicSkills, auditor, bumped } = setup();

    await service.set('t1', [], ACTOR);

    expect(topicSkills.replace).toHaveBeenCalledWith('t1', []);
    expect(auditor.record).toHaveBeenCalledWith(
      AuditAction.TOPIC_SKILLS_SET,
      { type: 'TOPIC', id: 't1' },
      ACTOR,
      { before: { skillIds: ['k1'] }, after: { skillIds: [] } },
    );
    expect(bumped).toHaveBeenCalledWith(['p1']);
  });

  it("to'plam o'zgarmagan — no-op; javob — ko'nikmalar ro'yxati", async () => {
    const { service, topicSkills, bumped } = setup(['k1', 'k2']);

    await expect(service.set('t1', ['k2', 'k1'], ACTOR)).resolves.toEqual({ skills: REFS });
    expect(topicSkills.replace).not.toHaveBeenCalled();
    expect(bumped).toHaveBeenCalledWith([]);
  });

  it("poygada ko'nikma o'chirildi (FK) — 400 skillIds, audit yo'q", async () => {
    const { service, topicSkills, auditor } = setup();
    topicSkills.replace.mockRejectedValue(new ForeignKeyViolationError('fk'));

    await expect(service.set('t1', ['k2'], ACTOR)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'skillIds' }],
    });
    expect(auditor.record).not.toHaveBeenCalled();
  });

  it("mavzu yo'q — 404", async () => {
    const { service, topics } = setup();
    topics.lockRecord.mockResolvedValue(null);

    await expect(service.set('t1', [], ACTOR)).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
