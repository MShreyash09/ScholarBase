-- Read-receipt watermark for study-room chat: one row per (room, user) holding
-- the last message that user has seen, from which every message's tick state
-- (sent / delivered / read) is derived without a row per message per reader.
CREATE TABLE "study_room_read_receipts" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_read_message_id" TEXT NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_room_read_receipts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "study_room_read_receipts_room_id_user_id_key" ON "study_room_read_receipts"("room_id", "user_id");

ALTER TABLE "study_room_read_receipts" ADD CONSTRAINT "study_room_read_receipts_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "study_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_room_read_receipts" ADD CONSTRAINT "study_room_read_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
