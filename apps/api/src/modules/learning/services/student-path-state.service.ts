import { Injectable } from '@nestjs/common';

import { ProgressSnapshotRepository } from '../repositories/progress-snapshot.repository.js';

import { PathEnrollmentService } from './path-enrollment.service.js';
import { PathUnlockCalculator } from './path-unlock-calculator.js';
import { StudentPathResolver } from './student-path-resolver.service.js';
import { VisiblePathLoader } from './visible-path-loader.service.js';

import type { StudentPathState, VisiblePath } from '../learning.types.js';
import type { CurrentPathRef } from './student-path-resolver.service.js';

/**
 * Har bir `/student/*` so'rovining boshi (3.3 §4.1): resolver → ko'rinadigan tuzilma → lazy
 * enrollment → progress → `PathUnlockCalculator`. Xarita, mavzu va dars endpointlari ochish hisobini
 * shu bitta joydan oladi.
 */
@Injectable()
export class StudentPathStateService {
  constructor(
    private readonly resolver: StudentPathResolver,
    private readonly loader: VisiblePathLoader,
    private readonly enrollment: PathEnrollmentService,
    private readonly snapshots: ProgressSnapshotRepository,
    private readonly calculator: PathUnlockCalculator,
  ) {}

  currentPath(studentId: string): Promise<CurrentPathRef | null> {
    return this.resolver.resolve(studentId);
  }

  /** Yo'l yo'q yoki nashr qilinmagan — `null`. `ref` berilmasa — joriy yo'l aniqlanadi. */
  async load(studentId: string, ref?: CurrentPathRef): Promise<StudentPathState | null> {
    const current = ref ?? (await this.resolver.resolve(studentId));
    if (current === null) {
      return null;
    }
    const path = await this.loader.load(current.pathId, current.contentVersion);
    if (path === null) {
      return null;
    }
    const chain = this.calculator.chain(path);
    const enrollment = await this.enrollment.ensure(studentId, path.id, chain[0]?.id ?? null);
    return this.build(studentId, path, enrollment.completedAt);
  }

  /** Yozuvdan keyin progress qayta o'qiladi (tuzilma o'zgarmaydi). */
  refresh(state: StudentPathState): Promise<StudentPathState> {
    return this.build(state.studentId, state.path, state.enrollmentCompletedAt);
  }

  private async build(
    studentId: string,
    path: VisiblePath,
    enrollmentCompletedAt: Date | null,
  ): Promise<StudentPathState> {
    const progress = await this.snapshots.load(studentId, path.id);
    return {
      studentId,
      path,
      chain: this.calculator.chain(path),
      progress,
      unlock: this.calculator.calculate(path, progress),
      enrollmentCompletedAt,
    };
  }
}
