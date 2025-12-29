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

  // Create temporary file
  const tempFilePath = path.join(os.tmpdir(), `stt-${Date.now()}-${Math.random().toString(36).substring(7)}.${filename.split('.').pop() || 'webm'}`);
  
  try {
    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, audioBuffer);
    
    const formData = new FormData();
    
    // Append file from temp path
    formData.append('file', fs.createReadStream(tempFilePath), {
      filename: filename,
      contentType: filename.endsWith('.webm') ? 'audio/webm' : 'audio/mpeg',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    // Get headers from form-data (includes boundary)
    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    };

    // Use axios instead of fetch for better form-data support
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const data = response.data;
    
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
