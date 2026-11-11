-- 2-bosqich (Admin asosi) bazasi — docs/11-database.md §2 (groups, group_members), §3 (faqat learning_paths).
-- Prisma generatsiya qilgan qism + oxirida Prisma ifodalay olmaydigan qo'lda yozilgan qism.

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "path_id" UUID NOT NULL,
    "mentor_id" UUID,
    "status" "GroupStatus" NOT NULL,
    "starts_at" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMPTZ,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" UUID NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "cover_file_id" UUID,
    "status" "ContentStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_groups_mentor_id_status" ON "groups"("mentor_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_learning_paths_slug" ON "learning_paths"("slug");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_cover_file_id_fkey" FOREIGN KEY ("cover_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===========================================================================
-- Qo'lda yozilgan qism (Prisma partial index'larni ifodalay olmaydi)
-- ===========================================================================

-- Student bir vaqtda faqat bitta faol guruhda (S-02 A, docs/11 §2): partial unique.
-- Guruhdan chiqqan a'zolik (`left_at` to'ldirilgan) tarix sifatida qoladi va cheklovga kirmaydi.
CREATE UNIQUE INDEX "uq_group_members_active_student" ON "group_members" ("student_id")
    WHERE "left_at" IS NULL;

-- Guruhning faol a'zolari ro'yxati (docs/11 §2): partial index.
CREATE INDEX "idx_group_members_group_id_active" ON "group_members" ("group_id")
    WHERE "left_at" IS NULL;
