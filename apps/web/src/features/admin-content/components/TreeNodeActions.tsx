'use client';

import Link from 'next/link';

import { Button } from '@/components/ui';

import {
  useDeleteLesson,
  useDeleteSection,
  useDeleteTopic,
  useUpdateLesson,
  useUpdateSection,
  useUpdateTopic,
} from '../hooks/useNodeMutations';
import { lessonEditorPath } from '../lib/admin-content-paths';

import { AddLessonDialog } from './AddLessonDialog';
import { AddChestDialog, ChestActions } from './ChestDialogs';
import { DeleteAction } from './DeleteAction';
import { AddTopicDialog, EditSectionDialog, EditTopicDialog } from './NodeDialogs';
import { NodeStatusToggle } from './NodeStatusToggle';

import type {
  AdminLessonNode,
  AdminSectionNode,
  AdminTopicNode,
} from '../types/admin-content.types';

/** Bo'lim qatori: mavzu va sandiq qo'shish, holat, tahrirlash, o'chirish. */
export function SectionActions({ section }: { section: AdminSectionNode }) {
  const update = useUpdateSection(section.id);
  const remove = useDeleteSection(section.id);
  return (
    <>
      <AddTopicDialog section={section} />
      <AddChestDialog section={section} />
      <NodeStatusToggle name={section.title} status={section.status} update={update} />
      <EditSectionDialog section={section} />
      <DeleteAction name={section.title} mutation={remove} />
    </>
  );
}

export interface TopicActionsProps {
  topic: AdminTopicNode;
  section: AdminSectionNode;
}

/** Mavzu qatori: dars qo'shish, (bo'lsa) undan keyingi sandiq, holat, tahrirlash, o'chirish. */
export function TopicActions({ topic, section }: TopicActionsProps) {
  const update = useUpdateTopic(topic.id);
  const remove = useDeleteTopic(topic.id);
  const chest = section.chests.find((item) => item.afterTopicId === topic.id);
  return (
    <>
      <AddLessonDialog topic={topic} />
      {chest !== undefined ? <ChestActions chest={chest} section={section} /> : null}
      <NodeStatusToggle name={topic.title} status={topic.status} update={update} />
      <EditTopicDialog topic={topic} />
      <DeleteAction name={topic.title} mutation={remove} />
    </>
  );
}

/** Dars qatori: muharrirga o'tish, holat, o'chirish. */
export function LessonActions({ lesson }: { lesson: AdminLessonNode }) {
  const update = useUpdateLesson(lesson.id);
  const remove = useDeleteLesson(lesson.id);
  return (
    <>
      <Button asChild variant="secondary" size="sm">
        <Link href={lessonEditorPath(lesson.id)} aria-label={`Muharrir: ${lesson.title}`}>
          Muharrir
        </Link>
      </Button>
      <NodeStatusToggle name={lesson.title} status={lesson.status} update={update} />
      <DeleteAction
        name={lesson.title}
        mutation={remove}
        description="Dars matni bilan o'chadi. Bu amalni qaytarib bo'lmaydi."
      />
    </>
  );
}
