import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { logger } from './utils/logger';
import { verifyDatabaseSetup } from './utils/database';
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import sessionRoutes from './modules/sessions/routes';
import topicRoutes from './modules/topics/routes';
import conversationRoutes from './modules/conversation/routes';
import feedbackRoutes from './modules/feedback/routes';
import adminRoutes from './modules/admin/routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  const dbStatus = await verifyDatabaseSetup();
  
  res.json({
    status: dbStatus.connected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      pgvectorInstalled: dbStatus.pgvectorInstalled,
      tablesExist: dbStatus.tablesExist,
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/topics', topicRoutes);
app.use('/api/v1/conversation', conversationRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/memory', memoryRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

