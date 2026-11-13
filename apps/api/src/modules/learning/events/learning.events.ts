/** Domen hodisalari (docs/13 §4, 3.3 §5) — backend ichki; 5- va 6-modullar tinglaydi. */
export const LearningEventName = {
  LESSON_COMPLETED: 'lesson.completed',
  TOPIC_COMPLETED: 'topic.completed',
} as const;

export interface LessonCompletedEvent {
  name: typeof LearningEventName.LESSON_COMPLETED;
  payload: {
    studentId: string;
    lessonId: string;
    topicId: string;
    pathId: string;
    completedAt: Date;
  };
}

export interface TopicCompletedEvent {
  name: typeof LearningEventName.TOPIC_COMPLETED;
  payload: { studentId: string; topicId: string; pathId: string; completedAt: Date };
}

export type LearningEvent = LessonCompletedEvent | TopicCompletedEvent;
