import type { PathSectionNode } from '@/components/ui';

import { PathNodeKind } from '../types/learning-path.types';

import { topicPath } from './learning-path-paths';

import type { StudentPathNode } from '../types/learning-path.types';

/** API tugunini `PathSection` tuguniga aylantiradi (mavzu → havola, joriy pozitsiya belgisi). */
export function toSectionNode(
  node: StudentPathNode,
  currentTopicId: string | null,
): PathSectionNode {
  if (node.kind === PathNodeKind.CHEST) {
    return { kind: PathNodeKind.CHEST, id: node.id, title: node.title, status: node.status };
  }
  return {
    kind: PathNodeKind.TOPIC,
    id: node.id,
    title: node.title,
    status: node.status,
    lessons: node.lessons,
    lessonsCompleted: node.lessonsCompleted,
    href: topicPath(node.id),
    current: node.id === currentTopicId,
  };
}
