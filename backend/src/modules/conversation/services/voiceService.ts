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
    // Step 1: Convert audio to text (STT)
    logger.info('Converting speech to text...');
    const sttResult = await speechToText(audioBuffer, `audio.${audioFormat}`);
    const userText = sttResult.text.trim();

    if (!userText) {
      throw new Error('No speech detected in audio');
    }

    logger.info(`STT result: "${userText}"`);

    // Step 2: Send text message to LLM (reuse existing conversation service)
    logger.info('Sending message to LLM...');
    const { message: userMessage, assistantMessage } = await sendMessage(
      userId,
      sessionId,
      userText
    );

    // Step 3: Convert LLM response to speech (TTS)
    logger.info('Converting text to speech...');
    const audioResponse = await textToSpeech(assistantMessage.content, {
      voice: 'nova', // Friendly, natural voice
      speed: 1.0,
      format: 'mp3',
    });

    return {
      userMessage,
      assistantMessage,
      audioBuffer: audioResponse,
    };
  } catch (error) {
    logger.error('Voice message processing error:', error);
    throw error;
  }
}

