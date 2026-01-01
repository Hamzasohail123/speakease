import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';

/**
 * Speech-to-Text Service
 * Converts audio to text using OpenAI Whisper API
 */

export interface STTResult {
  text: string;
  language?: string;
}

/**
 * Convert audio file to text using OpenAI Whisper
 */
export async function speechToText(audioBuffer: Buffer, filename: string = 'audio.webm'): Promise<STTResult> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  logger.info(`STT: Processing audio - size: ${audioBuffer.length} bytes, filename: ${filename}`);

  if (audioBuffer.length === 0) {
    throw new Error('Audio buffer is empty');
  }

  // Create temporary file
  const tempFilePath = path.join(os.tmpdir(), `stt-${Date.now()}-${Math.random().toString(36).substring(7)}.${filename.split('.').pop() || 'webm'}`);
  
  try {
    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, audioBuffer);
    logger.info(`STT: Written temp file: ${tempFilePath} (${audioBuffer.length} bytes)`);
    
    const formData = new FormData();
    
    // Determine content type based on filename
    let contentType = 'audio/webm';
    if (filename.endsWith('.mp3') || filename.endsWith('.mpeg')) {
      contentType = 'audio/mpeg';
    } else if (filename.endsWith('.wav')) {
      contentType = 'audio/wav';
    } else if (filename.endsWith('.ogg')) {
      contentType = 'audio/ogg';
    }
    
    // Append file from temp path
    formData.append('file', fs.createReadStream(tempFilePath), {
      filename: filename,
      contentType: contentType,
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'json');
    
    logger.info(`STT: Sending to OpenAI Whisper API - Content-Type: ${contentType}`);

    // Get headers from form-data (includes boundary)
    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    };

    // Use axios instead of fetch for better form-data support
    let response;
    try {
      response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 30000, // 30 second timeout
        }
      );
    } catch (axiosError: any) {
      logger.error('STT: Axios error:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
      });
      
      if (axiosError.response?.data?.error) {
        throw new Error(`STT API error: ${axiosError.response.data.error.message || JSON.stringify(axiosError.response.data.error)}`);
      }
      throw new Error(`STT API error: ${axiosError.message}`);
    }

    const data = response.data;
    
    logger.info(`STT: Response received - text length: ${data.text?.length || 0}, language: ${data.language || 'unknown'}`);
    logger.info(`STT: Transcribed text: "${data.text || ''}"`);
    logger.info(`STT: Full response data:`, JSON.stringify(data, null, 2));
    
    // Check if response has text field
    if (!data.hasOwnProperty('text')) {
      logger.error('STT: Response missing "text" field');
      logger.error('STT: Full response:', JSON.stringify(data));
      throw new Error('Invalid response from speech recognition service');
    }
    
    if (!data.text || data.text.trim().length === 0) {
      logger.warn('STT: Empty transcription received from OpenAI');
      logger.warn('STT: Full response:', JSON.stringify(data));
      throw new Error('No speech detected in audio. Please speak clearly and try again.');
    }
    
    // Check for suspicious single character responses
    const trimmedText = data.text.trim();
    if (trimmedText.length === 1 && trimmedText !== 'I' && trimmedText !== 'a' && trimmedText !== 'A') {
      logger.warn(`STT: Suspicious single character response: "${trimmedText}"`);
    }
    
    return {
      text: data.text || '',
      language: data.language,
    };
  } catch (err: any) {
    logger.error('STT service error:', err);
    
    // Extract error message
    let errorMessage = 'STT API error';
    if (err.response?.data) {
      errorMessage = err.response.data.error?.message || JSON.stringify(err.response.data);
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    throw new Error(`STT API error: ${errorMessage}`);
  } finally {
    // Cleanup temp file
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      logger.warn('Failed to cleanup temp file:', cleanupError);
    }
  }
}

/**
 * Convert audio file path to text
 */
export async function speechToTextFromFile(filePath: string): Promise<STTResult> {
  const audioBuffer = fs.readFileSync(filePath);
  return speechToText(audioBuffer, filePath.split('/').pop() || 'audio.webm');
}
