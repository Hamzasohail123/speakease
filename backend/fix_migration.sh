#!/bin/bash
# Fix migration by ensuring pgvector extension exists before migration runs
# This script connects to Neon and enables the extension

echo "Note: For Neon, you need to enable pgvector extension manually via SQL Editor"
echo "Run this SQL in Neon SQL Editor:"
echo ""
echo "CREATE EXTENSION IF NOT EXISTS vector;"
echo ""
echo "Then try: npm run db:migrate"
