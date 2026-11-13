import { AuditAction, ContentStatus, ErrorCode } from '@lms/shared';

import { ForeignKeyViolationError } from '../../../common/exceptions/constraint-violation.error.js';
import { ACTOR, fakeKit } from '../testing/content.fixtures.js';

import { SectionsService } from './sections.service.js';

import type { SectionRecord } from '../content.types.js';
import type { PathTreeService } from './path-tree.service.js';
import type { PathSectionsRepository } from '../repositories/path-sections.repository.js';

const ENTITY = { type: 'PATH_SECTION', id: 's1' };

const SECTION: SectionRecord = {
  id: 's1',
  parentId: 'p1',
  pathId: 'p1',
  title: 'Asoslar',
  description: null,
  status: ContentStatus.DRAFT,
};

function setup(current: SectionRecord | null = SECTION) {
  const sections = {
    lockParent: jest.fn().mockResolvedValue('p1'),
    nextOrder: jest.fn().mockResolvedValue(3),
    createNode: jest.fn().mockResolvedValue({ id: 's1' }),
    findRecord: jest.fn().mockResolvedValue(current),
    lockRecord: jest.fn().mockResolvedValue(current),
    applyChanges: jest.fn().mockResolvedValue(undefined),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };
  const tree = { section: jest.fn().mockResolvedValue({ id: 's1', topics: [], chests: [] }) };
  const fakes = fakeKit();
  const service = new SectionsService(
    sections as unknown as PathSectionsRepository,
    fakes.kit,
    tree as unknown as PathTreeService,
  );
  return { service, sections, tree, ...fakes };
}

/** `ContentNodeService` shabloni (bo'lim misolida; mavzu va dars ham shu yo'l bilan). */
describe('SectionsService', () => {
  it("yaratish: ota qulfi ostida oxiriga (nextOrder), DRAFT, audit, versiya — yo'l", async () => {
    const { service, sections, auditor, bumped, tree } = setup();

    const node = await service.create('p1', { title: 'Asoslar' }, ACTOR);

    expect(sections.lockParent).toHaveBeenCalledWith('p1');
    expect(sections.nextOrder).toHaveBeenCalledWith('p1');
    expect(sections.lockParent.mock.invocationCallOrder[0]).toBeLessThan(
      sections.nextOrder.mock.invocationCallOrder[0] ?? 0,
    );
    expect(sections.createNode).toHaveBeenCalledWith({
      parentId: 'p1',
      order: 3,
      fields: { title: 'Asoslar', description: null },
    });
    expect(auditor.record).toHaveBeenCalledWith(AuditAction.CONTENT_CREATED, ENTITY, ACTOR, {
      after: { title: 'Asoslar', parentId: 'p1' },
    });
    expect(bumped).toHaveBeenCalledWith(['p1']);
    expect(tree.section).toHaveBeenCalledWith('s1');
    expect(node).toMatchObject({ id: 's1', topics: [], chests: [] });
  });

  it("ota (yo'l) yo'q — 404, yozuv yo'q", async () => {
    const { service, sections } = setup();
    sections.lockParent.mockResolvedValue(null);

    await expect(service.create('p1', { title: 'X' }, ACTOR)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    expect(sections.createNode).not.toHaveBeenCalled();
  });

  it("PATCH: faqat o'zgargan maydonlar, holat ham — recordPatch, versiya", async () => {
    const { service, sections, auditor, bumped } = setup();

    await service.update('s1', { title: 'Asoslar', status: ContentStatus.ARCHIVED }, ACTOR);

    expect(sections.applyChanges).toHaveBeenCalledWith('s1', { status: ContentStatus.ARCHIVED });
    expect(auditor.recordPatch).toHaveBeenCalledWith(ENTITY, ACTOR, SECTION, {
      status: ContentStatus.ARCHIVED,
    });
    expect(bumped).toHaveBeenCalledWith(['p1']);
  });

  it("no-op PATCH — yozuv, audit va versiya yo'q", async () => {
    const { service, sections, auditor, bumped } = setup();

    await service.update('s1', { title: 'Asoslar', description: null }, ACTOR);

    expect(sections.applyChanges).not.toHaveBeenCalled();
    expect(auditor.recordPatch).not.toHaveBeenCalled();
    expect(bumped).toHaveBeenCalledWith([]);
  });

  it("o'chirish: progress bor — 409 HAS_PROGRESS (yozuv yo'q)", async () => {
    const { service, sections, progress } = setup();
    progress.hasProgress.mockResolvedValue(true);

    await expect(service.remove('s1', ACTOR)).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { reason: 'HAS_PROGRESS' },
    });
    expect(progress.hasProgress).toHaveBeenCalledWith('SECTION', 's1');
    expect(sections.deleteById).not.toHaveBeenCalled();
  });

  it("o'chirish: qulf tartibi ota → bola (tartiblash bilan bir xil)", async () => {
    const { service, sections } = setup();

    await service.remove('s1', ACTOR);

    expect(sections.lockParent).toHaveBeenCalledWith('p1');
    expect(sections.lockRecord).toHaveBeenCalledWith('s1');
    expect(sections.lockParent.mock.invocationCallOrder[0]).toBeLessThan(
      sections.lockRecord.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("o'chirish: ota yoki bola qulf paytida yo'qolgan — 404, o'chirilmaydi", async () => {
    const { service, sections } = setup();
    sections.lockParent.mockResolvedValueOnce(null);
    await expect(service.remove('s1', ACTOR)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });

    sections.lockRecord.mockResolvedValueOnce(null);
    await expect(service.remove('s1', ACTOR)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    expect(sections.deleteById).not.toHaveBeenCalled();
  });

  it("o'chirish poygasi (FK P2003) — 409 HAS_PROGRESS", async () => {
    const { service, sections } = setup();
    sections.deleteById.mockRejectedValue(new ForeignKeyViolationError('fk'));

    await expect(service.remove('s1', ACTOR)).rejects.toMatchObject({
      details: { reason: 'HAS_PROGRESS' },
    });
  });

  it("o'chirish: audit (title, parentId), versiya; yo'q — 404", async () => {
    const { service, auditor, bumped } = setup();

    await service.remove('s1', ACTOR);

    expect(auditor.record).toHaveBeenCalledWith(AuditAction.CONTENT_DELETED, ENTITY, ACTOR, {
      before: { title: 'Asoslar', parentId: 'p1' },
    });
    expect(bumped).toHaveBeenCalledWith(['p1']);
    await expect(setup(null).service.remove('s1', ACTOR)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });
});
