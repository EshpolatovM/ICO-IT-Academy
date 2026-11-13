import { AuditAction, ErrorCode } from '@lms/shared';

import { UniqueViolationError } from '../../../common/exceptions/constraint-violation.error.js';
import { ACTOR, fakeKit } from '../testing/content.fixtures.js';

import { SkillsService } from './skills.service.js';

import type { SkillsRepository } from '../repositories/skills.repository.js';

const SKILL = { id: 'k1', name: 'HTML', icon: null, topicsCount: 2 };

function setup() {
  const skills = {
    search: jest.fn().mockResolvedValue({ items: [SKILL], total: 1 }),
    findRecord: jest.fn().mockResolvedValue(SKILL),
    lockRecord: jest.fn().mockResolvedValue(SKILL),
    isNameTaken: jest.fn().mockResolvedValue(false),
    createSkill: jest.fn().mockResolvedValue({ id: 'k1' }),
    applyChanges: jest.fn().mockResolvedValue(undefined),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };
  const fakes = fakeKit();
  const service = new SkillsService(skills as unknown as SkillsRepository, fakes.kit);
  return { service, skills, ...fakes };
}

describe('SkillsService', () => {
  it("ro'yxat: offset pagination shakli", async () => {
    await expect(setup().service.list({ q: undefined, page: 1, pageSize: 20 })).resolves.toEqual({
      items: [SKILL],
      total: 1,
      page: 1,
      pageSize: 20,
    });
  });

  it('yaratish: audit, kontent versiyasi oshmaydi', async () => {
    const { service, skills, auditor, bumped } = setup();

    await expect(service.create({ name: 'HTML' }, ACTOR)).resolves.toEqual(SKILL);
    expect(skills.createSkill).toHaveBeenCalledWith({ name: 'HTML', icon: null });
    expect(auditor.record).toHaveBeenCalledWith(
      AuditAction.CONTENT_CREATED,
      { type: 'SKILL', id: 'k1' },
      ACTOR,
      { after: { name: 'HTML', parentId: null } },
    );
    expect(bumped).toHaveBeenCalledWith([]);
  });

  it('nom band — 409 `{ field: "name" }` (oldindan va poygada)', async () => {
    const expected = { code: ErrorCode.CONFLICT, details: { field: 'name' } };
    const { service, skills } = setup();
    skills.isNameTaken.mockResolvedValueOnce(true);
    await expect(service.create({ name: 'HTML' }, ACTOR)).rejects.toMatchObject(expected);

    skills.applyChanges.mockRejectedValueOnce(new UniqueViolationError('uq'));
    await expect(service.update('k1', { name: 'CSS' }, ACTOR)).rejects.toMatchObject(expected);
  });

  it("PATCH no-op — audit yo'q; o'chirish — audit; yo'q — 404", async () => {
    const { service, skills, auditor } = setup();

    await service.update('k1', { name: 'HTML' }, ACTOR);
    expect(skills.applyChanges).not.toHaveBeenCalled();

    await service.remove('k1', ACTOR);
    expect(skills.lockRecord).toHaveBeenCalledTimes(2);
    expect(auditor.record).toHaveBeenCalledWith(
      AuditAction.CONTENT_DELETED,
      { type: 'SKILL', id: 'k1' },
      ACTOR,
      { before: { name: 'HTML', parentId: null } },
    );

    skills.lockRecord.mockResolvedValue(null);
    await expect(service.update('k1', { name: 'CSS' }, ACTOR)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    await expect(service.remove('k1', ACTOR)).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
