import { ContentStatus, ErrorCode } from '@lms/shared';

import { ACTOR, fakeKit, pathRecord } from '../testing/content.fixtures.js';

import { PathPublishService } from './path-publish.service.js';

import type { PathDetailsService } from './path-details.service.js';
import type { LearningPathsRepository } from '../repositories/learning-paths.repository.js';
import type { PathPublishRepository } from '../repositories/path-publish.repository.js';

const ENTITY = { type: 'LEARNING_PATH', id: 'p1' };

function setup(current = pathRecord(), counts = { sections: 1, topics: 2, lessons: 3 }) {
  const paths = {
    lockRecord: jest.fn().mockResolvedValue(current),
    applyChanges: jest.fn().mockResolvedValue(undefined),
  };
  const publisher = { publishDrafts: jest.fn().mockResolvedValue(counts) };
  const details = { get: jest.fn().mockResolvedValue({ id: 'p1' }) };
  const fakes = fakeKit();
  const service = new PathPublishService(
    paths as unknown as LearningPathsRepository,
    publisher as unknown as PathPublishRepository,
    details as unknown as PathDetailsService,
    fakes.kit,
  );
  return { service, paths, publisher, ...fakes };
}

describe('PathPublishService', () => {
  it("DRAFT → PUBLISHED (cascade: false): bolalar repository'si chaqirilmaydi, bitta audit", async () => {
    const { service, paths, publisher, auditor, bumped } = setup();

    await service.publish('p1', false, ACTOR);

    expect(paths.applyChanges).toHaveBeenCalledWith('p1', { status: ContentStatus.PUBLISHED });
    expect(publisher.publishDrafts).not.toHaveBeenCalled();
    expect(auditor.recordStatus).toHaveBeenCalledWith(ENTITY, ACTOR, ContentStatus.DRAFT, {
      status: ContentStatus.PUBLISHED,
    });
    expect(bumped).toHaveBeenCalledWith(['p1']);
  });

  it("idempotent: allaqachon PUBLISHED — yozuv, audit va versiya yo'q", async () => {
    const { service, paths, auditor, bumped } = setup(
      pathRecord({ status: ContentStatus.PUBLISHED }),
    );

    await service.publish('p1', false, ACTOR);

    expect(paths.applyChanges).not.toHaveBeenCalled();
    expect(auditor.recordStatus).not.toHaveBeenCalled();
    expect(bumped).toHaveBeenCalledWith([]);
  });

  it('cascade: true — DRAFT bolalar nashr qilinadi, bitta audit yozuvi sonlar bilan', async () => {
    const { service, publisher, auditor } = setup();

    await service.publish('p1', true, ACTOR);

    expect(publisher.publishDrafts).toHaveBeenCalledWith('p1');
    expect(auditor.recordStatus).toHaveBeenCalledTimes(1);
    expect(auditor.recordStatus).toHaveBeenCalledWith(ENTITY, ACTOR, ContentStatus.DRAFT, {
      status: ContentStatus.PUBLISHED,
      cascade: true,
      published: { sections: 1, topics: 2, lessons: 3 },
    });
  });

  it("yo'l PUBLISHED, cascade: true va DRAFT bolalar bor — faqat bolalar yangilanadi", async () => {
    const { service, paths, auditor, bumped } = setup(
      pathRecord({ status: ContentStatus.PUBLISHED }),
      { sections: 0, topics: 0, lessons: 2 },
    );

    await service.publish('p1', true, ACTOR);

    expect(paths.applyChanges).not.toHaveBeenCalled();
    expect(auditor.recordStatus).toHaveBeenCalledWith(ENTITY, ACTOR, ContentStatus.PUBLISHED, {
      status: ContentStatus.PUBLISHED,
      cascade: true,
      published: { sections: 0, topics: 0, lessons: 2 },
    });
    expect(bumped).toHaveBeenCalledWith(['p1']);
  });

  it("yo'l PUBLISHED, cascade: true, DRAFT bola yo'q — no-op", async () => {
    const { service, auditor, bumped } = setup(pathRecord({ status: ContentStatus.PUBLISHED }), {
      sections: 0,
      topics: 0,
      lessons: 0,
    });

    await service.publish('p1', true, ACTOR);

    expect(auditor.recordStatus).not.toHaveBeenCalled();
    expect(bumped).toHaveBeenCalledWith([]);
  });

  it("yo'l yo'q — 404", async () => {
    const { service, paths } = setup();
    paths.lockRecord.mockResolvedValue(null);

    await expect(service.publish('p1', false, ACTOR)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });
});
