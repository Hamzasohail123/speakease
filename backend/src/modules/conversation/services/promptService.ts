import { UserProfile, Topic } from '@ai-english-speaker/shared';

export interface ConversationContext {
  userProfile?: UserProfile;
  topic?: Topic;
  previousMemories?: string[];
  sessionHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * Build system prompt with user context
 */
export function buildSystemPrompt(context: ConversationContext): string {
  let prompt = `You are a friendly and encouraging English-speaking practice partner. Your goal is to help users improve their English speaking skills through natural conversation.

Guidelines:
- Speak naturally and conversationally, like talking to a friend
- Ask open-ended questions to encourage longer responses
- Be patient and supportive
- Gently correct mistakes when appropriate, but don't interrupt the flow
- Show genuine interest in what the user is saying
- Keep responses concise (2-3 sentences) to encourage back-and-forth conversation
- Use simple, clear English appropriate for language learners
`;

  // Add user context if available
  if (context.userProfile) {
    prompt += `\nUser Information:\n`;
    if (context.userProfile.bio) {
      prompt += `- Bio: ${context.userProfile.bio}\n`;
    }
    if (context.userProfile.goals && context.userProfile.goals.length > 0) {
      prompt += `- Learning Goals: ${context.userProfile.goals.join(', ')}\n`;
    }
  }

  // Add topic context if available
  if (context.topic) {
    prompt += `\nConversation Topic: ${context.topic.name}\n`;
    if (context.topic.description) {
      prompt += `Description: ${context.topic.description}\n`;
    }
    prompt += `Focus the conversation around this topic. Ask questions related to it.\n`;
  }

  // Add previous memories if available
  if (context.previousMemories && context.previousMemories.length > 0) {
    prompt += `\nPrevious Conversations:\n`;
    context.previousMemories.forEach((memory, index) => {
      prompt += `${index + 1}. ${memory}\n`;
    });
    prompt += `\nReference these past conversations naturally. Ask follow-up questions about things mentioned before.\n`;
  }

  return prompt;
}

/**
 * Build conversation messages for LLM
 */
export function buildConversationMessages(
  systemPrompt: string,
  sessionHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Add conversation history
  sessionHistory.forEach((msg) => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  return messages;
}

