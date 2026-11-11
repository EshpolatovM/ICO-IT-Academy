import { Controller, Get } from '@nestjs/common';

import { Role } from '@lms/shared';
import type {
  MentorGroupItem,
  MentorGroupsResponse,
  MentorGroupStudentsResponse,
  MentorStudentProfile,
} from '@lms/shared';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { StudentScope } from '../../../common/decorators/student-scope.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { MentorGroupsService } from '../services/mentor-groups.service.js';

import type { RequestUser } from '../../../common/auth/request-user.types.js';

/**
 * Mentor sahifasi (docs/12 §12): faqat o'z ACTIVE guruhlari (boshqasi — 404) va o'z guruhidagi
 * studentlar (`@StudentScope`, scope'dan tashqari — 404).
 */
@Roles(Role.MENTOR)
@Controller('mentor')
export class MentorController {
  constructor(private readonly mentorGroups: MentorGroupsService) {}

  @Get('groups')
  groups(@CurrentUser() user: RequestUser): Promise<MentorGroupsResponse> {
    return this.mentorGroups.list(user.id);
  }

  @Get('groups/:id')
  group(@UuidParam('id') id: string, @CurrentUser() user: RequestUser): Promise<MentorGroupItem> {
    return this.mentorGroups.get(id, user.id);
  }

  @Get('groups/:id/students')
  groupStudents(
    @UuidParam('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<MentorGroupStudentsResponse> {
    return this.mentorGroups.students(id, user.id);
  }

  @Get('students/:id')
  @StudentScope('id')
  student(@UuidParam('id') studentId: string): Promise<MentorStudentProfile> {
    return this.mentorGroups.studentProfile(studentId);
  }
}
