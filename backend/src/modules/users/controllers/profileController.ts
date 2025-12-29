import { Request, Response, NextFunction } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserContext,
  addDocumentToProfile,
} from '../services/profileService';
import { updateProfileSchema, updateContextSchema, addDocumentSchema } from '../validators/profileValidators';

/**
 * Get current user's profile
 * GET /api/v1/users/profile
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const profile = await getUserProfile(req.user.id);

    res.json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Validate input
    const validatedData = updateProfileSchema.parse(req.body);

    // Update profile
    const profile = await updateUserProfile(req.user.id, validatedData);

    res.json({
      success: true,
      data: { profile },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user context (bio and goals)
 * POST /api/v1/users/profile/context
 */
export async function updateContext(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Validate input
    const validatedData = updateContextSchema.parse(req.body);

    // Update context
    const profile = await updateUserContext(req.user.id, validatedData);

    res.json({
      success: true,
      data: { profile },
      message: 'Context updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add document to profile (future feature)
 * POST /api/v1/users/profile/documents
 */
export async function addDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Validate input
    const validatedData = addDocumentSchema.parse(req.body);

    // Add document
    const profile = await addDocumentToProfile(
      req.user.id,
      validatedData.documentUrl,
      validatedData.documentName
    );

    res.json({
      success: true,
      data: { profile },
      message: 'Document added successfully',
    });
  } catch (error) {
    next(error);
  }
}

