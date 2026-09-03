import { speechToText } from './sttService';
import { textToSpeech } from './ttsService';
import { sendMessage } from './conversationService';
import { Message, MessageRole } from '@ai-english-speaker/shared';
import { logger } from '../../../utils/logger';
import { incrementVoiceUsage } from '../../billing/repositories/subscriptionRepository';

// Rough duration estimate from compressed audio size — there's no real decoder in
// the pipeline to measure exact length. ~16KB/s is a reasonable average for
// webm/opus voice recordings at typical browser MediaRecorder settings. Good
// enough to gate a daily quota; not accurate enough for anything billing-grade.
const ASSUMED_BYTES_PER_SECOND = 16_000;

function estimateAudioSeconds(audioBuffer: Buffer): number {
  return audioBuffer.length / ASSUMED_BYTES_PER_SECOND;
}

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
    logger.info(`STT Input: audioSize=${audioBuffer.length}, format=${audioFormat}`);
    
    let sttResult;
    try {
      sttResult = await speechToText(audioBuffer, `audio.${audioFormat}`);
    } catch (sttError) {
      logger.error('STT failed:', sttError);
      if (sttError instanceof Error) {
        throw new Error(`Speech recognition failed: ${sttError.message}`);
      }
      throw new Error('Speech recognition failed. Please try again.');
    }
    
    const userText = sttResult.text.trim();

    logger.info(`STT result: "${userText}" (length: ${userText.length})`);
    logger.info(`STT full result object:`, JSON.stringify(sttResult, null, 2));

    if (!userText || userText.length === 0) {
      logger.warn('No speech detected in audio - STT returned empty text');
      logger.warn('STT result object:', JSON.stringify(sttResult));
      throw new Error('No speech detected in audio. Please speak clearly and try again.');
    }

    // Check for suspicious values
    if (userText === '.' || userText.length === 1) {
      logger.error(`STT returned suspicious value: "${userText}"`);
      logger.error('This might indicate an STT error or audio format issue');
      throw new Error('Could not transcribe your speech. Please try speaking more clearly or check your microphone.');
    }

    // Step 2: Send text message to LLM (reuse existing conversation service)
    logger.info(`Sending message to LLM with text: "${userText}"`);
    const { message: userMessage, assistantMessage } = await sendMessage(
      userId,
      sessionId,
      userText
    );
    
    logger.info(`User message created: id=${userMessage.id}, content="${userMessage.content}"`);
    logger.info(`Assistant message created: id=${assistantMessage.id}, content="${assistantMessage.content.substring(0, 50)}..."`);

    logger.info(`LLM response received: "${assistantMessage.content.substring(0, 100)}..."`);

    // Step 3: Convert LLM response to speech (TTS)
    logger.info('Converting text to speech...');
    const audioResponse = await textToSpeech(assistantMessage.content, {
      voice: 'nova', // Friendly, natural voice
      speed: 1.0,
      format: 'mp3',
    });

    logger.info(`Voice message processing complete. Audio response size: ${audioResponse.length} bytes`);

    // Fire-and-forget: don't let quota bookkeeping delay the response.
    incrementVoiceUsage(userId, estimateAudioSeconds(audioBuffer)).catch((error) =>
      logger.error('Failed to increment voice usage quota', error)
    );

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

