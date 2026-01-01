import { speechToText } from './sttService';
import { textToSpeech } from './ttsService';
import { sendMessage } from './conversationService';
import { Message, MessageRole } from '@ai-english-speaker/shared';
import { logger } from '../../../utils/logger';

/**
 * Voice Conversation Service
 * Handles voice-based conversations: Audio → Text → LLM → Text → Audio
 */

export interface VoiceMessageResult {
  userMessage: Message;
  assistantMessage: Message;
  audioBuffer: Buffer; // TTS audio response
}

/**
 * Process voice message: STT → LLM → TTS
 */
export async function processVoiceMessage(
  userId: string,
  sessionId: string,
  audioBuffer: Buffer,
  audioFormat: string = 'webm'
): Promise<VoiceMessageResult> {
  try {
    logger.info(`Processing voice message: userId=${userId}, sessionId=${sessionId}, audioSize=${audioBuffer.length} bytes, format=${audioFormat}`);
    
    // Step 1: Convert audio to text (STT)
    logger.info('Converting speech to text...');
    const sttResult = await speechToText(audioBuffer, `audio.${audioFormat}`);
    const userText = sttResult.text.trim();

    logger.info(`STT result: "${userText}" (length: ${userText.length})`);

    if (!userText || userText.length === 0) {
      logger.warn('No speech detected in audio - returning empty response');
      throw new Error('No speech detected in audio. Please speak clearly and try again.');
    }

    // Step 2: Send text message to LLM (reuse existing conversation service)
    logger.info('Sending message to LLM...');
    const { message: userMessage, assistantMessage } = await sendMessage(
      userId,
      sessionId,
      userText
    );

    logger.info(`LLM response received: "${assistantMessage.content.substring(0, 100)}..."`);

    // Step 3: Convert LLM response to speech (TTS)
    logger.info('Converting text to speech...');
    const audioResponse = await textToSpeech(assistantMessage.content, {
      voice: 'nova', // Friendly, natural voice
      speed: 1.0,
      format: 'mp3',
    });

    logger.info(`Voice message processing complete. Audio response size: ${audioResponse.length} bytes`);

    return {
      userMessage,
      assistantMessage,
      audioBuffer: audioResponse,
    };
  } catch (error) {
    logger.error('Voice message processing error:', error);
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

