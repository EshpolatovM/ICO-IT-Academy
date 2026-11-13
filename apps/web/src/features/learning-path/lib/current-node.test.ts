import { describe, expect, it } from 'vitest';

import { TopicStatus } from '../types/learning-path.types';

import { findCurrentTopicId } from './current-node';
import { toSectionNode } from './path-nodes';
import { PATH_MAP_FIXTURE } from './test-fixtures';

describe('findCurrentTopicId / toSectionNode', () => {
  it("joriy — birinchi IN_PROGRESS/AVAILABLE mavzu; yo'q bo'lsa null", () => {
    expect(findCurrentTopicId(PATH_MAP_FIXTURE.sections)).toBe('t2');
    expect(findCurrentTopicId([])).toBeNull();
  });

  it('mavzu tuguni — havola va joriy belgisi; sandiq — havolasiz', () => {
    const [topic, chest] = PATH_MAP_FIXTURE.sections[0]?.nodes ?? [];
    expect(topic && toSectionNode(topic, 't1')).toMatchObject({
      href: '/path/topics/t1',
      current: true,
      status: TopicStatus.COMPLETED,
    });
    expect(chest && toSectionNode(chest, 't1')).not.toHaveProperty('href');
  });
});
