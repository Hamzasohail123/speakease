import OpenAI from 'openai';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';
import { buildSystemPrompt, ConversationContext } from '../services/promptService';

/**
 * OpenAI Realtime API Service
 * Handles real-time voice conversations via WebSocket
 */

export interface RealtimeSessionConfig {
  userId: string;
  sessionId: string;
  context: ConversationContext;
}

export class RealtimeService {
  private openai: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Build system instructions for Realtime API
   * Returns the instructions string to be sent to OpenAI
   */
  buildInstructions(config: RealtimeSessionConfig): string {
    try {
      // Build system prompt with user context
      const systemPrompt = buildSystemPrompt(config.context);
      logger.info(`Built instructions for session: userId=${config.userId}, sessionId=${config.sessionId}`);
      return systemPrompt;
    } catch (error) {
      logger.error('Failed to build instructions:', error);
      throw error;
    }
  }

}

// Singleton instance
export const realtimeService = new RealtimeService();

