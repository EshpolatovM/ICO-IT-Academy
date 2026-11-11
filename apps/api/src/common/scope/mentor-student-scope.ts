/**
 * Mentor scope'i (docs/01 §3.1): student mentorning ACTIVE (o'chirilmagan) guruhlaridan birining
 * FAOL a'zosimi. `common/` guruhlar moduliga bog'lanmasin — abstraksiya shu yerda, amalga oshirish
 * (`group_members` + Redis kesh) — `modules/groups` (`MentorScopeModule`, global).
 */
export abstract class MentorStudentScope {
  abstract isMentorOf(mentorId: string, studentId: string): Promise<boolean>;
}
