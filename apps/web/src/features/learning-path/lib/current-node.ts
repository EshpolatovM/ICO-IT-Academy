import { PathNodeKind, TopicStatus } from '../types/learning-path.types';

import type { StudentPathSection } from '../types/learning-path.types';

const CURRENT_STATUSES: ReadonlySet<TopicStatus> = new Set([
  TopicStatus.IN_PROGRESS,
  TopicStatus.AVAILABLE,
]);

/**
 * Joriy pozitsiya (docs/03 §2.1): zanjirdagi birinchi `IN_PROGRESS` yoki `AVAILABLE` mavzu
 * (3.3 §2.2 — server alohida maydon bermaydi). Topilmasa — `null`.
 */
export function findCurrentTopicId(sections: readonly StudentPathSection[]): string | null {
  for (const section of sections) {
    for (const node of section.nodes) {
      if (node.kind === PathNodeKind.TOPIC && CURRENT_STATUSES.has(node.status)) {
        return node.id;
      }
    }
  }
  return null;
}
