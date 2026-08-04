-- CreateEnum
CREATE TYPE "StudyRoomVisibility" AS ENUM ('public', 'private');

-- AlterTable
ALTER TABLE "study_rooms" ADD COLUMN "visibility" "StudyRoomVisibility" NOT NULL DEFAULT 'private';

-- AlterTable: invite_code is required and unique, so existing rooms are
-- backfilled with a random code before the NOT NULL constraint goes on.
ALTER TABLE "study_rooms" ADD COLUMN "invite_code" TEXT;
UPDATE "study_rooms" SET "invite_code" = replace(gen_random_uuid()::text, '-', '') WHERE "invite_code" IS NULL;
ALTER TABLE "study_rooms" ALTER COLUMN "invite_code" SET NOT NULL;

-- CreateTable
CREATE TABLE "study_room_members" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_room_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_rooms_invite_code_key" ON "study_rooms"("invite_code");

-- CreateIndex
CREATE INDEX "study_room_members_user_id_idx" ON "study_room_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "study_room_members_room_id_user_id_key" ON "study_room_members"("room_id", "user_id");

-- AddForeignKey
ALTER TABLE "study_room_members" ADD CONSTRAINT "study_room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "study_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_room_members" ADD CONSTRAINT "study_room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
