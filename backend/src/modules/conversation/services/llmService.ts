import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages: LLMMessage[], model: string): Promise<LLMResponse> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as any;
    logger.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = (await response.json()) as any;
  const content = data.choices[0]?.message?.content || '';

  return {
    content,
    model,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens as number,
          completionTokens: data.usage.completion_tokens as number,
          totalTokens: data.usage.total_tokens as number,
        }
      : undefined,
  };
}

// Cheapest Anthropic model — used only as an outage fallback when OpenAI fails,
// not part of the plan-based model tiering (that's OpenAI-only for now; see
// MODEL_FOR_PLAN in billing/services/planService.ts).
const ANTHROPIC_FALLBACK_MODEL = 'claude-3-haiku-20240307';

/**
 * Call Anthropic API
 */
async function callAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  // Anthropic requires system message to be separate
  const systemMessage = messages.find((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_FALLBACK_MODEL,
      max_tokens: 500,
      system: systemMessage?.content || '',
      messages: conversationMessages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as any;
    logger.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = (await response.json()) as any;
  const content = data.content[0]?.text || '';

  return {
    content,
    model: ANTHROPIC_FALLBACK_MODEL,
    usage: data.usage
      ? {
          promptTokens: data.usage.input_tokens as number,
          completionTokens: data.usage.output_tokens as number,
          totalTokens: (data.usage.input_tokens as number) + (data.usage.output_tokens as number),
        }
      : undefined,
  };
}

/**
 * Call LLM (OpenAI, with Anthropic as an outage fallback).
 * `model` is the plan-resolved OpenAI model (see planService.getModelForPlan) —
 * it's ignored on the Anthropic fallback path, which always uses the cheapest
 * Anthropic model since it only fires when OpenAI itself is down.
 */
export async function callLLM(messages: LLMMessage[], model: string): Promise<LLMResponse> {
  if (env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(messages, model);
    } catch (error: unknown) {
      logger.warn('OpenAI call failed, trying Anthropic:', error);
      if (env.ANTHROPIC_API_KEY) {
        return await callAnthropic(messages);
      }
      throw error;
    }
  }

  if (env.ANTHROPIC_API_KEY) {
    return await callAnthropic(messages);
  }

  throw new Error('No AI API key configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY');
}

