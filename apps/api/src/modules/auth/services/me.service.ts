import { Injectable } from '@nestjs/common';

import { ErrorCode, Role } from '@lms/shared';
import type { AuthUser, MeResponse, ParentMeResponse } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { toAuthUser } from '../mappers/auth-user.mapper.js';
import { toParentChildren } from '../mappers/parent-child.mapper.js';

import type { ParentRequestUser, RequestUser } from '../../../common/auth/request-user.types.js';

/**
 * `GET /auth/me` (docs/12 §1: "ANY + P"): akkauntli foydalanuvchi — `AuthUser`;
 * ota-ona — akkaunti yo'q, shuning uchun sessiyadagi farzandlar ro'yxati.
 */
@Injectable()
export class MeService {
  constructor(private readonly users: UsersRepository) {}

  getMe(user: RequestUser): Promise<MeResponse> {
    return user.role === Role.PARENT ? this.getParent(user) : this.getAccount(user.id);
  }

  private async getAccount(userId: string): Promise<AuthUser> {
    const user = await this.users.findAuthById(userId);
    if (!user) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    return toAuthUser(user);
  }

  private async getParent(user: ParentRequestUser): Promise<ParentMeResponse> {
    const students = await this.users.findStudentsByIds(user.studentIds);
    const byId = new Map(students.map((student) => [student.id, student]));
    const ordered = user.studentIds.flatMap((studentId) => {
      const student = byId.get(studentId);
      return student ? [{ ...student, studentId }] : [];
    });
    return { role: Role.PARENT, children: toParentChildren(ordered) };
  }
}
