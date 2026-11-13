import { Injectable } from '@nestjs/common';

import { PathNodeKind, TopicStatus } from '@lms/shared';
import type { ReviewBlock, StudentPathMap, StudentPathNode, StudentPathSection } from '@lms/shared';

import { PathProgressCalculator } from './path-progress-calculator.js';

import type { StudentPathState, VisibleSection, VisibleTopic } from '../learning.types.js';

/** Faol yo'l yo'q (S-D1): 200 `{ path: null, currentTopicId: null, reviewBlock, sections: [] }`. */
export function emptyPathMap(reviewBlock: ReviewBlock): StudentPathMap {
  return { path: null, currentTopicId: null, reviewBlock, sections: [] };
}

/**
 * `StudentPathMap` (docs/12 §4, 3.3 §2.2) — sof: hisoblangan holatlardan. Sandiq o'z `after_topic`
 * tugunidan keyin, shu bo'lim `nodes` ida turadi.
 */
@Injectable()
export class StudentPathMapBuilder {
  constructor(private readonly progress: PathProgressCalculator) {}

  build(state: StudentPathState, reviewBlock: ReviewBlock): StudentPathMap {
    return {
      path: {
        id: state.path.id,
        title: state.path.title,
        progress: this.progress.completedRatio(state.chain, state.unlock),
      },
      currentTopicId: state.unlock.currentTopicId,
      reviewBlock,
      sections: state.path.sections.map((section) => this.section(section, state)),
    };
  }

  private section(section: VisibleSection, state: StudentPathState): StudentPathSection {
    return {
      id: section.id,
      title: section.title,
      progress: this.progress.completedRatio(section.topics, state.unlock),
      nodes: section.topics.flatMap((topic) => [
        this.topicNode(topic, state),
        ...this.chestNodes(section, topic, state),
      ]),
    };
  }

  private topicNode(topic: VisibleTopic, state: StudentPathState): StudentPathNode {
    return {
      kind: PathNodeKind.TOPIC,
      id: topic.id,
      title: topic.title,
      icon: topic.icon,
      status: state.unlock.topics.get(topic.id) ?? TopicStatus.LOCKED,
      ...this.progress.topicLessons(topic, state.progress),
    };
  }

  private chestNodes(
    section: VisibleSection,
    topic: VisibleTopic,
    state: StudentPathState,
  ): StudentPathNode[] {
    return section.chests.flatMap((chest) => {
      const status = state.unlock.chests.get(chest.id);
      return chest.afterTopicId === topic.id && status !== undefined
        ? [{ kind: PathNodeKind.CHEST, id: chest.id, title: chest.title, status }]
        : [];
    });
  }
}
