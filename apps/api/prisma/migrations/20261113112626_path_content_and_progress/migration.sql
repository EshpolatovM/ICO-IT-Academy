-- 3-bosqich (Ilm yo'li) bazasi — docs/11-database.md §3: path_sections, topics, lessons, path_chests,
-- skills, topic_skills, student_path_enrollments, topic_progress, lesson_progress (topshiriq 3.1).
-- Prisma generatsiya qilgan qism + oxirida Prisma ifodalay olmaydigan qo'lda yozilgan qism.
-- Prisma generatsiya qilgan `uq_*_order` UNIQUE INDEX'lari olib tashlangan — ular pastda
-- DEFERRABLE constraint sifatida yaratiladi. Ma'lumot yozuvchi SQL (backfill) yo'q (TL Q-5).

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "path_sections" (
    "id" UUID NOT NULL,
    "path_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "status" "ContentStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "path_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(64),
    "status" "ContentStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "content_md" TEXT NOT NULL,
    "video_url" VARCHAR(512),
    "est_minutes" SMALLINT,
    "status" "ContentStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_chests" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "after_topic_id" UUID NOT NULL,
    "title" VARCHAR(64) NOT NULL,
    "reward" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "path_chests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "icon" VARCHAR(64),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_skills" (
    "topic_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,

    CONSTRAINT "topic_skills_pkey" PRIMARY KEY ("topic_id","skill_id")
);

-- CreateTable
CREATE TABLE "student_path_enrollments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "path_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "student_path_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_progress" (
    "student_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "status" "TopicStatus" NOT NULL,
    "lessons_completed" SMALLINT NOT NULL DEFAULT 0,
    "first_try_correct" INTEGER NOT NULL DEFAULT 0,
    "first_try_total" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "topic_progress_pkey" PRIMARY KEY ("student_id","topic_id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "student_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "status" "LessonProgressStatus" NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("student_id","lesson_id")
);

-- CreateIndex
CREATE INDEX "idx_path_chests_section_id" ON "path_chests"("section_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_path_chests_after_topic_id" ON "path_chests"("after_topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_skills_name" ON "skills"("name");

-- CreateIndex
CREATE INDEX "idx_topic_skills_skill_id" ON "topic_skills"("skill_id");

-- CreateIndex
CREATE INDEX "idx_student_path_enrollments_path_id" ON "student_path_enrollments"("path_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_student_path_enrollments_student_id_path_id" ON "student_path_enrollments"("student_id", "path_id");

-- CreateIndex
CREATE INDEX "idx_topic_progress_student_id_status" ON "topic_progress"("student_id", "status");

-- CreateIndex
CREATE INDEX "idx_topic_progress_topic_id_status" ON "topic_progress"("topic_id", "status");

-- CreateIndex
CREATE INDEX "idx_lesson_progress_student_id_completed_at" ON "lesson_progress"("student_id", "completed_at");

-- AddForeignKey
ALTER TABLE "path_sections" ADD CONSTRAINT "path_sections_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "path_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_chests" ADD CONSTRAINT "path_chests_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "path_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_chests" ADD CONSTRAINT "path_chests_after_topic_id_fkey" FOREIGN KEY ("after_topic_id") REFERENCES "topics"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_skills" ADD CONSTRAINT "topic_skills_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_skills" ADD CONSTRAINT "topic_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_path_enrollments" ADD CONSTRAINT "student_path_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_path_enrollments" ADD CONSTRAINT "student_path_enrollments_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===========================================================================
-- Qo'lda yozilgan qism (Prisma DEFERRABLE constraint va CHECK'larni ifodalay olmaydi)
-- ===========================================================================

-- Tartib unique'lari DEFERRABLE INITIALLY IMMEDIATE (docs/11 §3, tartib almashtirish uchun).
-- Oddiy INSERT/UPDATE'da darhol tekshiriladi; bitta statement ichidagi almashtirish
-- (`UPDATE ... FROM (VALUES ...)`) statement oxirida tekshiriladi; ko'p statementli tranzaksiyada
-- backend `SET CONSTRAINTS <nom> DEFERRED` qiladi. Schema'dagi `@@unique(map: ...)` shu nomlarga mos.
ALTER TABLE "path_sections" ADD CONSTRAINT "uq_path_sections_path_id_order"
    UNIQUE ("path_id", "order") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "topics" ADD CONSTRAINT "uq_topics_section_id_order"
    UNIQUE ("section_id", "order") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "lessons" ADD CONSTRAINT "uq_lessons_topic_id_order"
    UNIQUE ("topic_id", "order") DEFERRABLE INITIALLY IMMEDIATE;

-- `LOCKED` holat bazaga yozilmaydi: qator yo'q = locked (docs/11 §3 `topic_progress`).
ALTER TABLE "topic_progress" ADD CONSTRAINT "chk_topic_progress_status_not_locked"
    CHECK ("status" <> 'LOCKED');

-- `completed_at` faqat va albatta `COMPLETED` holatda to'ldirilgan. Backend `status` va
-- `completed_at` ni bitta statement'da yozadi.
ALTER TABLE "topic_progress" ADD CONSTRAINT "chk_topic_progress_completed_at"
    CHECK (("completed_at" IS NOT NULL) = ("status" = 'COMPLETED'));

ALTER TABLE "lesson_progress" ADD CONSTRAINT "chk_lesson_progress_completed_at"
    CHECK (("completed_at" IS NOT NULL) = ("status" = 'COMPLETED'));
