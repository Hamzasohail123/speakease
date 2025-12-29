import { Request, Response, NextFunction } from 'express';
import { testEmailConfiguration, sendTestEmail } from '../../auth/services/notificationService';
import prisma from '../../../config/database';
import { logger } from '../../../utils/logger';

/**
 * Test email configuration
 * GET /api/v1/admin/test-email
 */
export async function testEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isConfigured = await testEmailConfiguration();
    
    if (!isConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Email is not configured. Please set up SMTP or Gmail credentials in environment variables.',
        configured: false,
      });
    }

    // Send test email
    await sendTestEmail();

    res.json({
      success: true,
      message: 'Email is configured correctly! Check your inbox at hamzasohail429@gmail.com',
      configured: true,
    });
  } catch (error) {
    logger.error('Test email error:', error);
    next(error);
  }
}

/**
 * Get platform statistics
 * GET /api/v1/admin/stats
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const usersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const usersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get session statistics
    const totalSessions = await prisma.session.count();
    const sessionsToday = await prisma.session.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const activeSessions = await prisma.session.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Get message statistics
    const totalMessages = await prisma.message.count();
    const messagesToday = await prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          today: usersToday,
          thisWeek: usersThisWeek,
          recent: recentUsers,
        },
        sessions: {
          total: totalSessions,
          today: sessionsToday,
          active: activeSessions,
        },
        messages: {
          total: totalMessages,
          today: messagesToday,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    next(error);
  }
}

/**
 * Get all users (admin only)
 * GET /api/v1/admin/users
 */
export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        users,
        total: users.length,
      },
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
}

