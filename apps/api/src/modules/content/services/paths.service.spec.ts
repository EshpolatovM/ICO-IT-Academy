import { AuditAction, ContentStatus, ErrorCode } from '@lms/shared';

import {
  ForeignKeyViolationError,
  UniqueViolationError,
} from '../../../common/exceptions/constraint-violation.error.js';
import { ACTOR, fakeKit, pathRecord, UPDATED_AT } from '../testing/content.fixtures.js';

import { PathsService } from './paths.service.js';

import type { PathDetailsService } from './path-details.service.js';
import type { PathPublishService } from './path-publish.service.js';
import type { LearningPathsRepository } from '../repositories/learning-paths.repository.js';

function setup(current = pathRecord()) {
  const paths = {
    listItems: jest.fn().mockResolvedValue([]),
    lockRecord: jest.fn().mockResolvedValue(current),
    isSlugTaken: jest.fn().mockResolvedValue(false),
    createPath: jest.fn().mockResolvedValue({ id: 'p9' }),
    applyChanges: jest.fn().mockResolvedValue(undefined),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };
  const details = { get: jest.fn().mockResolvedValue({ id: current.id }) };
  const publisher = { publishLocked: jest.fn().mockResolvedValue(true) };
  const fakes = fakeKit();
  const service = new PathsService(
    paths as unknown as LearningPathsRepository,
    details as unknown as PathDetailsService,
    publisher as unknown as PathPublishService,
    fakes.kit,
  );
  return { service, paths, publisher, ...fakes };
}

describe('PathsService', () => {
  it("ro'yxat: `?status=` repository'ga, element ISO vaqt va sonlar bilan", async () => {
    const { service, paths } = setup();
    const item = {
      ...pathRecord(),
      updatedAt: UPDATED_AT,
      sectionsCount: 2,
      topicsCount: 3,
    };
    paths.listItems.mockResolvedValue([item]);

    const result = await service.list({ status: ContentStatus.ARCHIVED });

    expect(paths.listItems).toHaveBeenCalledWith(ContentStatus.ARCHIVED);
    expect(result.items).toEqual([
      {
        id: 'p1',
        title: 'Frontend',
        slug: 'frontend',
        status: ContentStatus.DRAFT,
        description: null,
        updatedAt: UPDATED_AT.toISOString(),
        sectionsCount: 2,
        topicsCount: 3,
      },
    ]);
  });

  it("yaratish: DRAFT, audit CONTENT_CREATED, versiya — yangi yo'l", async () => {
    const { service, paths, auditor, bumped } = setup();

    await service.create({ title: 'Backend', slug: 'backend' }, ACTOR);

    expect(paths.createPath).toHaveBeenCalledWith({
      title: 'Backend',
      slug: 'backend',
      description: null,
    });
    expect(auditor.record).toHaveBeenCalledWith(
      AuditAction.CONTENT_CREATED,
      { type: 'LEARNING_PATH', id: 'p9' },
      ACTOR,
      { after: { title: 'Backend', parentId: null } },
    );
    expect(bumped).toHaveBeenCalledWith(['p9']);
  });

  it('slug band — 409, details obyekt `{ field: "slug" }` (oldindan tekshiruv va poyga)', async () => {
    const { service, paths } = setup();
    paths.isSlugTaken.mockResolvedValueOnce(true);
    const expected = { code: ErrorCode.CONFLICT, details: { field: 'slug' } };

    await expect(service.create({ title: 'X', slug: 'x' }, ACTOR)).rejects.toMatchObject(expected);
    paths.createPath.mockRejectedValueOnce(new UniqueViolationError('uq'));
    await expect(service.create({ title: 'X', slug: 'x' }, ACTOR)).rejects.toMatchObject(expected);
    paths.applyChanges.mockRejectedValueOnce(new UniqueViolationError('uq'));
    await expect(service.update('p1', { slug: 'y' }, ACTOR)).rejects.toMatchObject(expected);
  });

  it('PATCH status: PUBLISHED → PathPublishService (cascade: false), maydonlar alohida', async () => {
    const current = pathRecord();
    const { service, paths, publisher, auditor, bumped } = setup(current);

    await service.update('p1', { title: 'Yangi', status: ContentStatus.PUBLISHED }, ACTOR);

    expect(paths.applyChanges).toHaveBeenCalledWith('p1', { title: 'Yangi' });
    expect(auditor.recordPatch).toHaveBeenCalledWith(
      { type: 'LEARNING_PATH', id: 'p1' },
      ACTOR,
      current,
      { title: 'Yangi' },
    );
    expect(publisher.publishLocked).toHaveBeenCalledWith(current, false, ACTOR);
    expect(bumped).toHaveBeenCalledWith(['p1']);
  });

  it('PATCH status: ARCHIVED — holat yoziladi va CONTENT_STATUS_CHANGED', async () => {
    const { service, paths, publisher, auditor } = setup();

    await service.update('p1', { status: ContentStatus.ARCHIVED }, ACTOR);

    expect(publisher.publishLocked).not.toHaveBeenCalled();
    expect(paths.applyChanges).toHaveBeenCalledWith('p1', { status: ContentStatus.ARCHIVED });
    expect(auditor.recordStatus).toHaveBeenCalledWith(
      { type: 'LEARNING_PATH', id: 'p1' },
      ACTOR,
      ContentStatus.DRAFT,
      { status: ContentStatus.ARCHIVED },
    );
  });

  it("no-op PATCH (bir xil qiymatlar) — yozuv, audit va versiya yo'q", async () => {
    const { service, paths, auditor, bumped } = setup();

    await service.update('p1', { title: 'Frontend', status: ContentStatus.DRAFT }, ACTOR);

    expect(paths.applyChanges).not.toHaveBeenCalled();
    expect(auditor.recordPatch).not.toHaveBeenCalled();
    expect(bumped).toHaveBeenCalledWith([]);
  });

  it("yo'l yo'q — 404", async () => {
    const { service, paths } = setup();
    paths.lockRecord.mockResolvedValue(null);

    await expect(service.update('p1', { title: 'X' }, ACTOR)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    await expect(service.remove('p1', ACTOR)).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });

  it("o'chirish: ishlatilsa — 409 PATH_IN_USE (groupsCount bilan), aks holda audit + versiya", async () => {
    const { service, paths, progress, auditor, bumped } = setup();
    progress.pathUsage.mockResolvedValueOnce({ groupsCount: 2, inUse: true });

    await expect(service.remove('p1', ACTOR)).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { reason: 'PATH_IN_USE', groupsCount: 2 },
    });
    expect(paths.deleteById).not.toHaveBeenCalled();

    await service.remove('p1', ACTOR);
    expect(paths.deleteById).toHaveBeenCalledWith('p1');
    expect(auditor.record).toHaveBeenCalledWith(
      AuditAction.CONTENT_DELETED,
      { type: 'LEARNING_PATH', id: 'p1' },
      ACTOR,
      { before: { title: 'Frontend', parentId: null } },
    );
    expect(bumped).toHaveBeenLastCalledWith(['p1']);
  });

  it("o'chirish poygasi (FK P2003) — groupsCount rollback'dan keyin qayta o'qiladi", async () => {
    const { service, paths, progress } = setup();
    paths.deleteById.mockRejectedValueOnce(new ForeignKeyViolationError('fk'));
    progress.pathUsage
      .mockResolvedValueOnce({ groupsCount: 0, inUse: false })
      .mockResolvedValueOnce({ groupsCount: 1, inUse: true });

    await expect(service.remove('p1', ACTOR)).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { reason: 'PATH_IN_USE', groupsCount: 1 },
    });
  });
});
