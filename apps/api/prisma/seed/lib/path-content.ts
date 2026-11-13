import { ContentStatus } from '../../../src/infra/prisma/generated/client.js';

import { ScriptError } from './errors.js';

import type { EnsureResult } from './groups.js';
import type {
  LearningPath,
  Prisma,
  PrismaClient,
  Skill,
} from '../../../src/infra/prisma/generated/client.js';
import type { SeedSection, SeedSkill, SeedTopic } from '../data/dev-path-content.js';

type SkillsByName = ReadonlyMap<string, Skill>;

/** Massiv o'rnidan `order` (1 dan boshlab). */
const toOrder = (index: number): number => index + 1;

/**
 * Ko'nikmalar: `name` bo'yicha topadi, yo'q bo'lsa yaratadi. Mavjud ko'nikma o'zgartirilmaydi.
 * @returns har bir ko'nikma va u shu chaqiruvda yaratilganmi
 */
export async function ensureSkills(
  prisma: PrismaClient,
  skills: readonly SeedSkill[],
): Promise<EnsureResult<Skill>[]> {
  const results: EnsureResult<Skill>[] = [];
  for (const skill of skills) {
    const existing = await prisma.skill.findUnique({ where: { name: skill.name } });
    if (existing) {
      results.push({ record: existing, created: false });
      continue;
    }
    const record = await prisma.skill.create({ data: { name: skill.name, icon: skill.icon } });
    results.push({ record, created: true });
  }
  return results;
}

function skillIdOf(skills: SkillsByName, name: string): string {
  const skill = skills.get(name);
  if (!skill) {
    throw new ScriptError(`Seed kontentida noma'lum ko'nikma: "${name}".`);
  }
  return skill.id;
}

async function createTopic(
  tx: Prisma.TransactionClient,
  sectionId: string,
  topic: SeedTopic,
  index: number,
  skills: SkillsByName,
): Promise<void> {
  const created = await tx.topic.create({
    data: {
      sectionId,
      order: toOrder(index),
      title: topic.title,
      description: topic.description,
      icon: topic.icon,
      status: ContentStatus.PUBLISHED,
      lessons: {
        create: topic.lessons.map((lesson, lessonIndex) => ({
          order: toOrder(lessonIndex),
          title: lesson.title,
          contentMd: lesson.contentMd,
          videoUrl: lesson.videoUrl,
          estMinutes: lesson.estMinutes,
          status: ContentStatus.PUBLISHED,
        })),
      },
      skills: { create: topic.skillNames.map((name) => ({ skillId: skillIdOf(skills, name) })) },
    },
  });
  if (topic.chestAfter) {
    await tx.pathChest.create({
      data: {
        sectionId,
        afterTopicId: created.id,
        title: topic.chestAfter.title,
        reward: topic.chestAfter.reward,
      },
    });
  }
}

async function createSection(
  tx: Prisma.TransactionClient,
  pathId: string,
  section: SeedSection,
  index: number,
  skills: SkillsByName,
): Promise<void> {
  const created = await tx.pathSection.create({
    data: {
      pathId,
      order: toOrder(index),
      title: section.title,
      description: section.description,
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [topicIndex, topic] of section.topics.entries()) {
    await createTopic(tx, created.id, topic, topicIndex, skills);
  }
}

/**
 * Yo'l kontenti (bo'limlar, mavzular, darslar, sandiqlar, `topic_skills`) — bitta tranzaksiyada.
 * Yo'lda kamida bitta bo'lim bo'lsa hech narsa qilinmaydi: admin qo'lda o'zgartirgan tartib bilan
 * `(path_id, order)` to'qnashmasin. Enrollment va progress qatorlari yaratilmaydi (lazy, TL Q-5).
 * @returns kontent shu chaqiruvda yaratildimi
 */
export async function ensurePathContent(
  prisma: PrismaClient,
  path: LearningPath,
  sections: readonly SeedSection[],
  skills: SkillsByName,
): Promise<boolean> {
  const existingSections = await prisma.pathSection.count({ where: { pathId: path.id } });
  if (existingSections > 0) {
    return false;
  }
  await prisma.$transaction(async (tx) => {
    for (const [index, section] of sections.entries()) {
      await createSection(tx, path.id, section, index, skills);
    }
  });
  return true;
}
