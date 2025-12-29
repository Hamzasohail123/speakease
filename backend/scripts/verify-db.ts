#!/usr/bin/env tsx
/**
 * Database Setup Verification Script
 * 
 * This script verifies that:
 * 1. Database connection works
 * 2. pgvector extension is installed
 * 3. All required tables exist
 * 4. Initial data can be seeded
 */

import { verifyDatabaseSetup } from '../src/utils/database';
import { logger } from '../src/utils/logger';
import prisma from '../src/config/database';

async function main() {
  console.log('🔍 Verifying database setup...\n');

  const status = await verifyDatabaseSetup();

  // Check connection
  if (!status.connected) {
    console.error('❌ Database connection failed!');
    console.error('   Please check your DATABASE_URL in .env file');
    process.exit(1);
  }
  console.log('✅ Database connection: OK');

  // Check pgvector
  if (!status.pgvectorInstalled) {
    console.warn('⚠️  pgvector extension not installed');
    console.warn('   Run: CREATE EXTENSION vector; in your database');
    console.warn('   This is required for AI memory features (Phase 2)');
  } else {
    console.log('✅ pgvector extension: Installed');
  }

  // Check tables
  if (!status.tablesExist) {
    console.warn('⚠️  Required tables not found');
    console.warn('   Run: npm run db:migrate');
    process.exit(1);
  }
  console.log('✅ Database tables: OK');

  // Check if topics are seeded
  try {
    const topicCount = await prisma.topic.count();
    if (topicCount === 0) {
      console.warn('⚠️  No topics found in database');
      console.warn('   Run: npm run db:seed');
    } else {
      console.log(`✅ Topics seeded: ${topicCount} topics found`);
    }
  } catch (error) {
    console.error('❌ Error checking topics:', error);
  }

  console.log('\n✨ Database setup verification complete!');
  console.log('   You can now start the development server: npm run dev');
}

main()
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

