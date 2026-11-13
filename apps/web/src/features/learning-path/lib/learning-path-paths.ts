/** Student ilm yo'li sahifalari (Q-11). Route o'zgarsa faqat shu fayl yangilanadi. */
export const LEARNING_PATH_HOME = '/path';

export function topicPath(topicId: string): string {
  return `${LEARNING_PATH_HOME}/topics/${encodeURIComponent(topicId)}`;
}

export function lessonPath(lessonId: string): string {
  return `${LEARNING_PATH_HOME}/lessons/${encodeURIComponent(lessonId)}`;
}
