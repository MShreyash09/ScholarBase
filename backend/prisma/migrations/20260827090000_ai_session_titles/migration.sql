-- Human-readable name for a ScholarBoy conversation, derived from its first
-- question. Nullable: sessions created before this migration have no title and
-- fall back to their first message in the UI.
ALTER TABLE "ai_sessions" ADD COLUMN "title" TEXT;

-- The history list is "my sessions, newest activity first"; the old userId-only
-- index left that as a sort of the whole user partition.
DROP INDEX IF EXISTS "ai_sessions_user_id_idx";
CREATE INDEX "ai_sessions_user_id_updated_at_idx" ON "ai_sessions"("user_id", "updated_at");
