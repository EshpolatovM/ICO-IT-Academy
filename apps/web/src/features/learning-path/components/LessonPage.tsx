'use client';

import { Alert, Markdown, NodeStatusBadge, PageHeader, Stack } from '@/components/ui';
import type { PageHeaderBackLink } from '@/components/ui';
import { errorMessage } from '@/lib/api';

import { useAutoStartLesson } from '../hooks/useAutoStartLesson';
import { useLesson } from '../hooks/useLearningPathQueries';
import { LEARNING_PATH_HOME, topicPath } from '../lib/learning-path-paths';

import { LearningQueryView } from './LearningQueryView';
import { LessonCompletePanel, LessonNav } from './LessonCompletePanel';
import { LessonVideoLink } from './LessonVideoLink';

import type { StudentLesson } from '../types/learning-path.types';

const MAP_LINK: PageHeaderBackLink = { href: LEARNING_PATH_HOME, label: "Ilm yo'li" };

function LessonContent({ lesson }: { lesson: StudentLesson }) {
  const start = useAutoStartLesson(lesson);
  return (
    <Stack gap="6">
      <PageHeader
        back={{ href: topicPath(lesson.topic.id), label: lesson.topic.title }}
        title={lesson.title}
        titleAddon={<NodeStatusBadge kind="TOPIC" status={lesson.status} />}
        description={`${String(lesson.estMinutes)} daqiqa`}
      />
      {start.isError ? <Alert variant="warning">{errorMessage(start.error)}</Alert> : null}
      <LessonVideoLink videoUrl={lesson.videoUrl} />
      <Markdown source={lesson.contentMd} />
      <LessonCompletePanel lesson={lesson} />
      <LessonNav lesson={lesson} />
    </Stack>
  );
}

/** `/path/lessons/[lessonId]` — dars matni, video havola, "Darsni tugatdim" (docs/03 §2.2). */
export function LessonPage({ lessonId }: { lessonId: string }) {
  return (
    <LearningQueryView
      query={useLesson(lessonId)}
      back={MAP_LINK}
      notFoundTitle="Dars topilmadi"
      lockedTitle="Dars hali qulflangan"
    >
      {(lesson) => <LessonContent lesson={lesson} />}
    </LearningQueryView>
  );
}
