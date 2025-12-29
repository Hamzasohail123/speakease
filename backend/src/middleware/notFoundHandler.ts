import { Request, Response } from 'express';
import { ERROR_MESSAGES } from '@ai-english-speaker/shared';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: ERROR_MESSAGES.NOT_FOUND,
    path: req.path,
  });
};

