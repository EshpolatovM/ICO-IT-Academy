'use client';

import { Alert, EmptyState, Stack, TreeList } from '@/components/ui';
import type { TreeListItem, TreeListMoveContext } from '@/components/ui';

import { useReorder } from '../hooks/useReorder';
import { contentErrorText } from '../lib/content-errors';
import { contentStatusBadge } from '../lib/content-status';
import { buildReorder, MOVE_DOWN, MOVE_UP } from '../lib/tree-order';

import { LessonActions, SectionActions, TopicActions } from './TreeNodeActions';

import type { MoveDelta } from '../lib/tree-order';
import type { AdminPathTree, AdminSectionNode } from '../types/admin-content.types';

function sectionItem(section: AdminSectionNode): TreeListItem {
  return {
    id: section.id,
    title: section.title,
    status: contentStatusBadge(section.status),
    actions: <SectionActions section={section} />,
    children: section.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      status: contentStatusBadge(topic.status),
      actions: <TopicActions topic={topic} section={section} />,
      children: topic.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        status: contentStatusBadge(lesson.status),
        actions: <LessonActions lesson={lesson} />,
      })),
    })),
  };
}

/**
 * Yo'l daraxti: bo'lim → mavzu → dars (sandiq — o'zidan oldingi mavzu qatorida). "Yuqoriga/Pastga"
 * shu darajaning yangi to'liq tartibini `PUT …/order` ga yuboradi (Q-3).
 */
export function PathTreeEditor({ tree }: { tree: AdminPathTree }) {
  const reorder = useReorder();
  if (tree.sections.length === 0) {
    return (
      <EmptyState
        title="Hali bo'lim yo'q"
        description={`"Bo'lim qo'shish" tugmasi bilan boshlang.`}
      />
    );
  }
  const move =
    (delta: MoveDelta) =>
    (_item: TreeListItem, { parentId, index }: TreeListMoveContext) => {
      const request = buildReorder(tree, parentId, index, delta);
      if (request !== null) {
        reorder.mutate(request);
      }
    };
  return (
    <Stack gap="3">
      {reorder.error !== null ? (
        <Alert variant="danger">{contentErrorText(reorder.error)}</Alert>
      ) : null}
      <TreeList
        label="Yo'l daraxti"
        items={tree.sections.map(sectionItem)}
        onMoveUp={move(MOVE_UP)}
        onMoveDown={move(MOVE_DOWN)}
        moveDisabled={reorder.isPending}
      />
    </Stack>
  );
}
