'use client';

import { useState } from 'react';

import {
  Button,
  NodeStatusBadge,
  PathNode,
  PathSection,
  ProgressBar,
  Stack,
  TreeList,
} from '@/components/ui';
import type {
  ChestNodeStatus,
  PathSectionNode,
  TopicNodeStatus,
  TreeListItem,
  TreeListMoveContext,
} from '@/components/ui';

import { PreviewSection } from './PreviewSection';

const TOPIC_STATUSES: readonly TopicNodeStatus[] = [
  'LOCKED',
  'AVAILABLE',
  'IN_PROGRESS',
  'COMPLETED',
];
const CHEST_STATUSES: readonly ChestNodeStatus[] = ['LOCKED', 'READY', 'OPENED'];

const SECTION_NODES: readonly PathSectionNode[] = [
  {
    id: 't1',
    kind: 'TOPIC',
    title: 'Teglar',
    status: 'COMPLETED',
    lessons: 3,
    lessonsCompleted: 3,
    href: '/design-preview',
  },
  { id: 'c1', kind: 'CHEST', status: 'OPENED' },
  {
    id: 't2',
    kind: 'TOPIC',
    title: 'Formalar',
    status: 'IN_PROGRESS',
    lessons: 4,
    lessonsCompleted: 1,
    href: '/design-preview',
    current: true,
  },
  {
    id: 't3',
    kind: 'TOPIC',
    title: 'Jadval',
    status: 'AVAILABLE',
    lessons: 2,
    lessonsCompleted: 0,
    href: '/design-preview',
    hint: 'Avval takrorlang (2 ta)',
  },
  { id: 'c2', kind: 'CHEST', status: 'READY', title: "Bo'lim sandig'i" },
  {
    id: 't4',
    kind: 'TOPIC',
    title: 'Semantik teglar',
    status: 'LOCKED',
    lessons: 3,
    lessonsCompleted: 0,
    href: '/design-preview',
  },
];

const INITIAL_TREE: readonly TreeListItem[] = [
  {
    id: 's1',
    title: 'HTML asoslari',
    status: { label: 'PUBLISHED', variant: 'success' },
    children: [
      {
        id: 't1',
        title: 'Teglar',
        status: { label: 'PUBLISHED', variant: 'success' },
        children: [
          { id: 'l1', title: '1-dars: Kirish' },
          { id: 'l2', title: '2-dars: Paragraf' },
        ],
      },
      { id: 't2', title: 'Formalar', status: { label: 'DRAFT' } },
    ],
  },
  { id: 's2', title: 'CSS', status: { label: 'DRAFT' } },
  { id: 's3', title: 'JavaScript', status: { label: 'ARCHIVED', variant: 'warning' } },
];

/** Namuna uchun: `parentId` ichidagi `index` elementni `offset` ga suradi. */
function moveItem(
  items: readonly TreeListItem[],
  { parentId, index }: TreeListMoveContext,
  offset: number,
): readonly TreeListItem[] {
  if (parentId === null) {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    if (moved !== undefined) {
      next.splice(index + offset, 0, moved);
    }
    return next;
  }
  return items.map((item) => ({
    ...item,
    children:
      item.children === undefined
        ? undefined
        : moveItem(
            item.children,
            item.id === parentId ? { parentId: null, index } : { parentId, index },
            offset,
          ),
  }));
}

function TreePreview() {
  const [tree, setTree] = useState(INITIAL_TREE);
  return (
    <TreeList
      label="Namuna yo'l daraxti"
      items={tree.map((item) => ({
        ...item,
        actions: (
          <Button size="sm" variant="ghost">
            Tahrirlash
          </Button>
        ),
      }))}
      onMoveUp={(_item, context) => {
        setTree((value) => moveItem(value, context, -1));
      }}
      onMoveDown={(_item, context) => {
        setTree((value) => moveItem(value, context, 1));
      }}
    />
  );
}

function StatusesPreview() {
  return (
    <Stack gap="3">
      <Stack direction="horizontal" gap="2" wrap>
        {TOPIC_STATUSES.map((status) => (
          <NodeStatusBadge key={status} kind="TOPIC" status={status} />
        ))}
      </Stack>
      <Stack direction="horizontal" gap="2" wrap>
        {CHEST_STATUSES.map((status) => (
          <NodeStatusBadge key={status} kind="CHEST" status={status} />
        ))}
      </Stack>
    </Stack>
  );
}

/** Ilm yo'li komponentlari: ProgressBar, NodeStatusBadge, PathNode, PathSection, TreeList. */
export function LearningPathSection() {
  return (
    <>
      <PreviewSection
        id="progress-bar"
        title="ProgressBar"
        description="0%, oraliq va 100%; foizsiz variant."
      >
        <Stack gap="3">
          <ProgressBar value={0} label="Boshlanmagan" />
          <ProgressBar value={0.375} label="Yo'l progressi" />
          <ProgressBar value={1} label="Tugallangan" />
          <ProgressBar value={0.5} label="Foiz matnisiz" showValue={false} />
        </Stack>
      </PreviewSection>
      <PreviewSection
        id="node-status"
        title="NodeStatusBadge"
        description="Mavzu va sandiq holatlari: belgi + matn."
      >
        <StatusesPreview />
      </PreviewSection>
      <PreviewSection
        id="path-section"
        title="PathSection va PathNode"
        description="Vertikal zanjir (ol/li); LOCKED havola emas; joriy pozitsiya; sandiq tugmasi hozircha disabled."
      >
        <Stack gap="6">
          <PathSection title="HTML asoslari" progress={0.33} nodes={SECTION_NODES} headingAs="h3" />
          <PathNode kind="CHEST" status="LOCKED" title="Alohida sandiq tuguni" />
        </Stack>
      </PreviewSection>
      <PreviewSection
        id="tree-list"
        title="TreeList"
        description="Admin daraxti: yig'ish/yoyish, Badge, amallar, Yuqoriga/Pastga (birinchi/oxirgida disabled). Drag-and-drop yo'q."
      >
        <TreePreview />
      </PreviewSection>
    </>
  );
}
