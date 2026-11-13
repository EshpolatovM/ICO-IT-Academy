import { HeadedTable } from '@/components/shared';
import { NodeStatusBadge, TableCell, TableEmpty, TableRow, Text, TextLink } from '@/components/ui';

import { lessonPath } from '../lib/learning-path-paths';
import { LessonStatus } from '../types/learning-path.types';

import type { StudentTopicLesson } from '../types/learning-path.types';

const HEADERS = ['#', 'Dars', 'Davomiyligi', 'Holat'] as const;

function LessonTitle({ lesson }: { lesson: StudentTopicLesson }) {
  if (lesson.status === LessonStatus.LOCKED) {
    return (
      <Text as="span" variant="muted" aria-disabled="true">
        {lesson.title}
      </Text>
    );
  }
  return <TextLink href={lessonPath(lesson.id)}>{lesson.title}</TextLink>;
}

/** Mavzu darslari: qulflangan dars havola emas. */
export function TopicLessonsTable({ lessons }: { lessons: readonly StudentTopicLesson[] }) {
  return (
    <HeadedTable label="Mavzu darslari" headers={HEADERS}>
      {lessons.length === 0 ? (
        <TableEmpty colSpan={HEADERS.length} title="Bu mavzuda hali dars yo'q" />
      ) : (
        lessons.map((lesson, index) => (
          <TableRow key={lesson.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <LessonTitle lesson={lesson} />
            </TableCell>
            <TableCell>{lesson.estMinutes} daqiqa</TableCell>
            <TableCell>
              <NodeStatusBadge kind="TOPIC" status={lesson.status} />
            </TableCell>
          </TableRow>
        ))
      )}
    </HeadedTable>
  );
}
