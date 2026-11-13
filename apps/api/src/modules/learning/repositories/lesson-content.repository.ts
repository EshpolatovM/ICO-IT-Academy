import { Injectable } from '@nestjs/common';

import { ContentStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

export interface LessonContentRecord {
  contentMd: string;
  videoUrl: string | null;
}

const PUBLISHED = ContentStatus.PUBLISHED;

/**
 * Bitta darsning matni — faqat butun zanjiri `PUBLISHED` bo'lsa (TL Q-1; kontent tuzilmasi keshi
 * eskirgan bo'lsa ham nashrdan olingan dars matni berilmaydi).
 */
@Injectable()
export class LessonContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findVisible(lessonId: string): Promise<LessonContentRecord | null> {
    return this.prisma.client.lesson.findFirst({
      where: {
        id: lessonId,
        status: PUBLISHED,
        topic: { status: PUBLISHED, section: { status: PUBLISHED, path: { status: PUBLISHED } } },
      },
      select: { contentMd: true, videoUrl: true },
    });
  }
}
