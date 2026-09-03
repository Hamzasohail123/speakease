import { Message, MessageRole, SessionStatus } from '@ai-english-speaker/shared';
import { callLLM } from './llmService';
import { buildSystemPrompt, buildConversationMessages, ConversationContext } from './promptService';
import { getSessionById, getSessionMessages, addMessage } from '../../sessions/repositories/sessionRepository';
import { getUserProfile } from '../../users/services/profileService';
import { getTopicById } from '../../topics/repositories/topicRepository';
import { AppError } from '../../../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-english-speaker/shared';
import { logger } from '../../../utils/logger';
import { getPlanForUser, getModelForPlan, estimateCostCents } from '../../billing/services/planService';
import { recordUsage } from '../../billing/repositories/subscriptionRepository';

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  userId: string,
  sessionId: string,
  userMessage: string
): Promise<{ message: Message; assistantMessage: Message }> {
  // Verify session belongs to user and is active
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new AppError(ERROR_MESSAGES.SESSION_NOT_FOUND, 404);
  }

  if (session.userId !== userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, 403);
  }

  if (session.status !== SessionStatus.ACTIVE) {
    throw new AppError('Session is not active', 400);
  }

  // Get user profile for context
  const userProfile = await getUserProfile(userId);

  // Get topic if available
  let topic = null;
  if (session.topicId) {
    topic = await getTopicById(session.topicId);
  }

  // Get conversation history
  const existingMessages = await getSessionMessages(sessionId);
  const sessionHistory = existingMessages.map((msg) => ({
    role: msg.role === MessageRole.USER ? ('user' as const) : ('assistant' as const),
    content: msg.content,
  }));

  // Build context
  const context: ConversationContext = {
    userProfile,
    topic: topic || undefined,
    sessionHistory,
    // TODO: Add previous memories when Module 7 is built
    previousMemories: [],
  };

  // Build system prompt
  const systemPrompt = buildSystemPrompt(context);

  // Add user message to history
  const updatedHistory = [...sessionHistory, { role: 'user' as const, content: userMessage }];

  // Build LLM messages
  const llmMessages = buildConversationMessages(systemPrompt, updatedHistory);

  // Resolve which model this user's plan is entitled to (see billing/services/planService)
  const plan = await getPlanForUser(userId);
  const model = getModelForPlan(plan);

  // Call LLM
  let assistantResponse: string;
  try {
    const llmResponse = await callLLM(llmMessages, model);
    assistantResponse = llmResponse.content;

    if (llmResponse.usage) {
      await recordUsage({
        userId,
        sessionId,
        model: llmResponse.model,
        tokens: llmResponse.usage.totalTokens,
        costCents: estimateCostCents(llmResponse.model, llmResponse.usage.totalTokens),
      });
    }
  } catch (error) {
    logger.error('LLM call failed:', error);
    // Fallback response if LLM fails
    assistantResponse = "I'm having trouble responding right now. Could you try again?";
  }

  // Save user message
  logger.info(`Saving user message to database: "${userMessage}"`);
  const userMessageRecord = await addMessage(sessionId, MessageRole.USER, userMessage);
  logger.info(`User message saved: id=${userMessageRecord.id}, content="${userMessageRecord.content}"`);

  // Save assistant message
  logger.info(`Saving assistant message to database: "${assistantResponse.substring(0, 50)}..."`);
  const assistantMessageRecord = await addMessage(
    sessionId,
    MessageRole.ASSISTANT,
    assistantResponse
  );
  logger.info(`Assistant message saved: id=${assistantMessageRecord.id}`);

  return {
    message: userMessageRecord,
    assistantMessage: assistantMessageRecord,
  };
}

