import { getSessionMessages, addMessage } from '../../sessions/repositories/sessionRepository';
import { MessageRole } from '@ai-english-speaker/shared';
import { logger } from '../../../utils/logger';

/**
 * Transcript Service
 * Saves real-time conversation transcripts to database
 */

/**
 * Save transcript from Realtime API event
 */
export async function saveTranscript(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  try {
    if (!content || content.trim().length === 0) {
      logger.warn(`[TRANSCRIPT] Skipping empty transcript for ${role} in session ${sessionId}`);
      return;
    }
    
    logger.info(`[TRANSCRIPT] Saving ${role} transcript: sessionId=${sessionId}, content="${content.substring(0, 100)}..."`);
    
    const message = await addMessage(
      sessionId,
      role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT,
      content
    );
    
    logger.info(`[TRANSCRIPT] ✅ Successfully saved ${role} message: id=${message.id}, sessionId=${sessionId}`);
  } catch (error) {
    logger.error(`[TRANSCRIPT] ❌ Error saving transcript for ${role} in session ${sessionId}:`, error);
    throw error; // Re-throw to surface the error
  }
}

/**
 * Get session transcript
 */
export async function getTranscript(sessionId: string): Promise<string> {
  try {
    const messages = await getSessionMessages(sessionId);
    return messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');
  } catch (error) {
    logger.error('Error getting transcript:', error);
    return '';
  }
}

