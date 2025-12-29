-- Enable pgvector extension
-- Run this SQL command using the External Database URL from Render

CREATE EXTENSION IF NOT EXISTS vector;

-- Verify it's installed
SELECT * FROM pg_extension WHERE extname = 'vector';

