-- CreateTable
CREATE TABLE "study_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_room_messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_room_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_rooms_is_active_created_at_idx" ON "study_rooms"("is_active", "created_at");

-- CreateIndex
CREATE INDEX "study_room_messages_room_id_created_at_idx" ON "study_room_messages"("room_id", "created_at");

-- AddForeignKey
ALTER TABLE "study_rooms" ADD CONSTRAINT "study_rooms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_room_messages" ADD CONSTRAINT "study_room_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "study_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_room_messages" ADD CONSTRAINT "study_room_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
