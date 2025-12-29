import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // AI Services
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // OAuth (Future)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // Redis (Future)
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),

  // Email (Feedback)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_SECURE: process.env.SMTP_SECURE || 'false',
  SMTP_FROM: process.env.SMTP_FROM || '',
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || '',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

