import { Request, Response, NextFunction } from 'express';
import { processVoiceMessage } from '../services/voiceService';
import { AppError } from '../../../middleware/errorHandler';
import multer from 'multer';

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

/**
 * Process voice message (audio upload)
 * POST /api/v1/conversation/voice
 */
export async function processVoice(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const sessionId = req.body.sessionId || req.query.sessionId;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required',
      });
    }

    // Process voice message
    const result = await processVoiceMessage(
      req.user.id,
      sessionId,
      file.buffer,
      file.mimetype.split('/')[1] || 'webm'
    );

    // Return response with audio as base64
    res.json({
      success: true,
      data: {
        userMessage: result.userMessage,
        assistantMessage: result.assistantMessage,
        audio: result.audioBuffer.toString('base64'),
        audioFormat: 'mp3',
      },
    });
  } catch (error) {
    next(error);
  }
}

// Export multer middleware
export const voiceUpload = upload.single('audio');

