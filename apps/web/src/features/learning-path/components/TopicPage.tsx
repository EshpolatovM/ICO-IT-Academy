'use client';

import { Badge, NodeStatusBadge, PageHeader, ProgressBar, Stack } from '@/components/ui';
import type { PageHeaderBackLink } from '@/components/ui';

import { useTopic } from '../hooks/useLearningPathQueries';
import { LEARNING_PATH_HOME } from '../lib/learning-path-paths';

import { LearningQueryView } from './LearningQueryView';
import { TopicLessonsTable } from './TopicLessonsTable';

import type { StudentTopicDetail } from '../types/learning-path.types';

const MAP_LINK: PageHeaderBackLink = { href: LEARNING_PATH_HOME, label: "Ilm yo'li" };

function topicProgress(topic: StudentTopicDetail): number {
  return topic.lessons.length === 0 ? 0 : topic.lessonsCompleted / topic.lessons.length;
}

function TopicContent({ topic }: { topic: StudentTopicDetail }) {
  return (
    <Stack gap="6">
      <PageHeader
        back={MAP_LINK}
        title={topic.title}
        titleAddon={<NodeStatusBadge kind="TOPIC" status={topic.status} />}
        description={topic.description ?? topic.section.title}
      />
      <ProgressBar value={topicProgress(topic)} label="Mavzu progressi" />
      {topic.skills.length > 0 ? (
        <Stack direction="horizontal" gap="2" wrap aria-label="Ko'nikmalar">
          {topic.skills.map((skill) => (
            <Badge key={skill.id} variant="neutral">
              {skill.name}
            </Badge>
          ))}
        </Stack>
      ) : null}
      <TopicLessonsTable lessons={topic.lessons} />
    </Stack>
  );
}

/** `/path/topics/[topicId]` — mavzu va uning darslari (docs/03 §2.2). */
export function TopicPage({ topicId }: { topicId: string }) {
  return (
    <LearningQueryView
      query={useTopic(topicId)}
      back={MAP_LINK}
      notFoundTitle="Mavzu topilmadi"
      lockedTitle="Mavzu hali qulflangan"
    >
      {(topic) => <TopicContent topic={topic} />}
    </LearningQueryView>
  );
}
