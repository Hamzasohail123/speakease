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
    await addMessage(
      sessionId,
      role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT,
      content
    );
    logger.debug(`Saved transcript: ${role} - ${content.substring(0, 50)}...`);
  } catch (error) {
    logger.error('Error saving transcript:', error);
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

