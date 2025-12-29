-- Setup script for pgvector extension
-- Run this in your PostgreSQL database before running migrations

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';

-- If the above query returns a row, pgvector is installed successfully

