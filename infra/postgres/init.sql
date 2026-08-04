-- Extensions required by the ScholarBase schema.
-- vector: pgvector, used from phase 4 (question/notes embeddings) onward.
-- citext: case-insensitive email column.
-- pg_trgm: fuzzy/trigram text search, backs full-text search alongside tsvector.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
