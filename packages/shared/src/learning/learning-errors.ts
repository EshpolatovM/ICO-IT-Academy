/** Takrorlash kerak bo'lgan mavzu (`REVIEW_REQUIRED.details.due[]`, docs/12 §4). */
export interface ReviewDueTopic {
  topicId: string;
  title: string;
}

/** 409 `REVIEW_REQUIRED` javobining `details` i (3.3 R Q-5, docs/05 §2.3). */
export interface ReviewRequiredDetails {
  due: ReviewDueTopic[];
}
