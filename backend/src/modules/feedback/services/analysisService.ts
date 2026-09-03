import { callLLM } from '../../conversation/services/llmService';
import { Mistake } from '@ai-english-speaker/shared';
import { logger } from '../../../utils/logger';

// Feedback analysis runs once per session, not per message, so plan-tiered
// model routing (see billing/services/planService) doesn't apply here — it's a
// fixed, deliberately cheap model regardless of the user's plan.
const ANALYSIS_MODEL = 'gpt-4o-mini';

export interface AnalysisResult {
  mistakes: Mistake[];
  improvements: string[];
  tips: string[];
  reportText: string;
}

/**
 * Analyze transcript for mistakes and generate feedback
 */
export async function analyzeTranscript(
  transcript: string,
  previousMistakes?: Mistake[]
): Promise<AnalysisResult> {
  // Build analysis prompt
  const analysisPrompt = buildAnalysisPrompt(transcript, previousMistakes);

  // Call LLM for analysis
  let analysisResponse: string;
  try {
    const llmResponse = await callLLM(
      [
        {
          role: 'system',
          content: `You are an expert English teacher analyzing a student's conversation transcript. Your task is to identify mistakes, provide constructive feedback, and suggest improvements. Be friendly and encouraging.`,
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      ANALYSIS_MODEL
    );

    analysisResponse = llmResponse.content;
  } catch (error) {
    logger.error('Analysis LLM call failed:', error);
    // Return basic feedback if LLM fails
    return {
      mistakes: [],
      improvements: ['Keep practicing!'],
      tips: ['Try to speak more naturally'],
      reportText: 'Analysis unavailable. Keep practicing!',
    };
  }

  // Parse LLM response and extract structured data
  return parseAnalysisResponse(analysisResponse, transcript);
}

/**
 * Build analysis prompt
 */
function buildAnalysisPrompt(transcript: string, previousMistakes?: Mistake[]): string {
  let prompt = `Analyze the following English conversation transcript and provide detailed feedback.

Transcript:
${transcript}

Please provide:
1. **Repeated Mistakes**: List grammar mistakes that appear multiple times, grouped by category (tense confusion, have/had/has, prepositions, sentence structure, etc.)
2. **Good Improvements**: Positive feedback about what the student did well
3. **Simple Tips**: Actionable tips for the next session

Format your response as JSON with this structure:
{
  "mistakes": [
    {
      "category": "tense-confusion",
      "incorrect": "example incorrect sentence",
      "correct": "corrected sentence",
      "explanation": "simple explanation",
      "frequency": 3
    }
  ],
  "improvements": ["positive feedback 1", "positive feedback 2"],
  "tips": ["tip 1", "tip 2"],
  "reportText": "A friendly, readable report in plain English"
}`;

  if (previousMistakes && previousMistakes.length > 0) {
    prompt += `\n\nPrevious mistakes to watch for:\n${JSON.stringify(previousMistakes, null, 2)}`;
  }

  return prompt;
}

/**
 * Parse LLM response into structured data
 */
function parseAnalysisResponse(response: string, transcript: string): AnalysisResult {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        mistakes: parsed.mistakes || [],
        improvements: parsed.improvements || [],
        tips: parsed.tips || [],
        reportText: parsed.reportText || generateDefaultReport(parsed),
      };
    }
  } catch (error) {
    logger.warn('Failed to parse LLM response as JSON:', error);
  }

  // Fallback: generate basic feedback from text
  return generateFallbackFeedback(response);
}

/**
 * Generate default report from parsed data
 */
function generateDefaultReport(parsed: any): string {
  let report = 'Session English Report\n\n';

  if (parsed.mistakes && parsed.mistakes.length > 0) {
    report += '1. Repeated Mistakes\n';
    parsed.mistakes.forEach((mistake: any, index: number) => {
      report += `${index + 1}. ${mistake.explanation || mistake.category}\n`;
      if (mistake.incorrect) report += `   ❌ "${mistake.incorrect}"\n`;
      if (mistake.correct) report += `   ✅ "${mistake.correct}"\n`;
    });
    report += '\n';
  }

  if (parsed.improvements && parsed.improvements.length > 0) {
    report += '2. Good Improvements\n';
    parsed.improvements.forEach((imp: string) => {
      report += `- ${imp}\n`;
    });
    report += '\n';
  }

  if (parsed.tips && parsed.tips.length > 0) {
    report += '3. Tips for Next Session\n';
    parsed.tips.forEach((tip: string) => {
      report += `- ${tip}\n`;
    });
  }

  return report;
}

/**
 * Generate fallback feedback from text response
 */
function generateFallbackFeedback(response: string): AnalysisResult {
  return {
    mistakes: [],
    improvements: ['You completed the conversation!'],
    tips: ['Keep practicing regularly'],
    reportText: response || 'Thank you for practicing! Keep up the good work.',
  };
}

