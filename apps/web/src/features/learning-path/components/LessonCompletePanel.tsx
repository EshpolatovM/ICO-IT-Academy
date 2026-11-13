'use client';

import Link from 'next/link';

import { Alert, Button, Stack, Text, TextLink } from '@/components/ui';
import { errorMessage } from '@/lib/api';

import { useCompleteLesson } from '../hooks/useLessonMutations';
import { LEARNING_PATH_HOME, lessonPath } from '../lib/learning-path-paths';
import { LessonStatus } from '../types/learning-path.types';

import type { LessonCompleteResponse, StudentLesson } from '../types/learning-path.types';

function CompletedAlert({ result }: { result: LessonCompleteResponse }) {
  return (
    <Alert variant="success" title="Dars tugallandi">
      {result.next === null ? (
        <TextLink href={LEARNING_PATH_HOME}>Ilm yo&apos;liga qaytish</TextLink>
      ) : (
        <TextLink href={lessonPath(result.next.lessonId)}>Keyingi dars</TextLink>
      )}
    </Alert>
  );
}

/** "Darsni tugatdim": complete mutation, natija (keyingi dars) yoki xato. */
export function LessonCompletePanel({ lesson }: { lesson: Pick<StudentLesson, 'id' | 'status'> }) {
  const complete = useCompleteLesson(lesson.id);

  if (complete.data !== undefined) {
    return <CompletedAlert result={complete.data} />;
  }
  if (lesson.status === LessonStatus.COMPLETED) {
    return <Text variant="muted">Bu dars tugallangan.</Text>;
  }
  return (
    <Stack gap="3" align="start">
      {complete.isError ? <Alert variant="danger">{errorMessage(complete.error)}</Alert> : null}
      <Button
        loading={complete.isPending}
        onClick={() => {
          complete.mutate();
        }}
      >
        Darsni tugatdim
      </Button>
    </Stack>
  );
}

/** Mavzu ichidagi oldingi/keyingi dars. Keyingisi faqat joriy dars tugagach ko'rsatiladi. */
export function LessonNav({ lesson }: { lesson: StudentLesson }) {
  const showNext = lesson.nextLessonId !== null && lesson.status === LessonStatus.COMPLETED;
  if (lesson.prevLessonId === null && !showNext) {
    return null;
  }
  return (
    <Stack direction="horizontal" justify="between" gap="3" wrap>
      {lesson.prevLessonId === null ? null : (
        <Button asChild variant="secondary" size="sm">
          <Link href={lessonPath(lesson.prevLessonId)}>← Oldingi dars</Link>
        </Button>
      )}
      {showNext && lesson.nextLessonId !== null ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={lessonPath(lesson.nextLessonId)}>Keyingi dars →</Link>
        </Button>
      ) : null}
    </Stack>
  );
}
