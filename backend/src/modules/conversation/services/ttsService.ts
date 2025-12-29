import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';

/**
 * Text-to-Speech Service
 * Converts text to audio using OpenAI TTS API
 */

export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

const DEFAULT_OPTIONS: TTSOptions = {
  voice: 'nova',
  speed: 1.0,
  format: 'mp3',
};

/**
 * Convert text to speech using OpenAI TTS
 */
export async function textToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<Buffer> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: finalOptions.voice,
        speed: finalOptions.speed,
        response_format: finalOptions.format,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: { message?: string } };
      throw new Error(`TTS API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return audioBuffer;
  } catch (error) {
    logger.error('TTS service error:', error);
    throw error;
  }
}

/**
 * Get available TTS voices
 */
export function getAvailableVoices(): TTSOptions['voice'][] {
  return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
}

