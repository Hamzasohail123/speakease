import prisma from '../config/database';
import { logger } from './logger';

/**
 * Check if database connection is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
}

/**
 * Check if pgvector extension is installed
 */
export async function checkPgVectorExtension(): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as exists
    `;
    return result[0]?.exists || false;
  } catch (error) {
    logger.error('pgvector extension check failed', error);
    return false;
  }
}

/**
 * Verify database setup
 */
export async function verifyDatabaseSetup(): Promise<{
  connected: boolean;
  pgvectorInstalled: boolean;
  tablesExist: boolean;
}> {
  const connected = await checkDatabaseHealth();
  
  if (!connected) {
    return {
      connected: false,
      pgvectorInstalled: false,
      tablesExist: false,
    };
  }

  const pgvectorInstalled = await checkPgVectorExtension();

  // Check if main tables exist
  let tablesExist = false;
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'sessions', 'topics')
    `;
    tablesExist = Number(result[0]?.count || 0) >= 3;
  } catch (error) {
    logger.error('Table existence check failed', error);
  }

  return {
    connected,
    pgvectorInstalled,
    tablesExist,
  };
}

