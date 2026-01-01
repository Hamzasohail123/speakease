import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import { createServer } from 'http';

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
import { setupRealtimeWebSocket } from './modules/conversation/realtime/websocketProxy';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for Render
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (non-blocking, quick response)
app.get('/health', async (req, res) => {
  try {
    // Quick health check - don't block on database verification
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Detailed health check endpoint
app.get('/health/detailed', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
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

// Create HTTP server for WebSocket support
const server = createServer(app);

// Setup Realtime WebSocket
setupRealtimeWebSocket(server);

// Start server
server.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running on ${HOST}:${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔌 Realtime WebSocket ready on /api/v1/conversation/realtime/ws`);
  logger.info(`❤️  Health check available at /health`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;

