import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';
import type {
  MentorGroupItem,
  MentorGroupsResponse,
  MentorGroupStudentsResponse,
  MentorStudentProfile,
} from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { groupNotFoundException } from '../groups.errors.js';
import {
  toMentorGroupItem,
  toMentorStudent,
  toMentorStudentProfile,
} from '../mappers/group.mapper.js';
import { MentorGroupsRepository } from '../repositories/mentor-groups.repository.js';

import type { MentorGroupRecord } from '../groups.types.js';

/**
 * Mentor sahifasi (docs/12 §12, docs/03 §3): o'z ACTIVE guruhlari, guruh studentlari va student
 * profili. Boshqa mentorning (yoki arxivlangan) guruhi — 404. Student profiliga kirish
 * `@StudentScope` orqali tekshiriladi (controller). Progress/XP/streak — keyingi bosqichlarda.
 */
@Injectable()
export class MentorGroupsService {
  constructor(private readonly repository: MentorGroupsRepository) {}

  async list(mentorId: string): Promise<MentorGroupsResponse> {
    return { items: (await this.repository.listForMentor(mentorId)).map(toMentorGroupItem) };
  }

  async get(id: string, mentorId: string): Promise<MentorGroupItem> {
    return toMentorGroupItem(await this.requireOwnGroup(id, mentorId));
  }

  async students(id: string, mentorId: string): Promise<MentorGroupStudentsResponse> {
    const group = await this.requireOwnGroup(id, mentorId);
    return { items: (await this.repository.listStudents(group.id)).map(toMentorStudent) };
  }

  async studentProfile(studentId: string): Promise<MentorStudentProfile> {
    const profile = await this.repository.findStudentProfile(studentId, new Date());
    if (!profile) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
    return toMentorStudentProfile(profile);
  }

  private async requireOwnGroup(id: string, mentorId: string): Promise<MentorGroupRecord> {
    const group = await this.repository.findForMentor(id, mentorId);
    if (!group) {
      throw groupNotFoundException();
    }
    return group;
  }
}
