'use client';

import { Message, MessageRole } from '@ai-english-speaker/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Bot, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptDisplayProps {
  messages: Message[];
  title?: string;
  description?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

export function TranscriptDisplay({
  messages,
  title = 'Conversation Transcript',
  description,
  showHeader = true,
  maxHeight = '600px',
}: TranscriptDisplayProps) {
  if (!messages || messages.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No messages in this session</p>
        </CardContent>
      </Card>
    );
  }

  const userMessages = messages.filter(m => m.role === MessageRole.USER).length;
  const aiMessages = messages.filter(m => m.role === MessageRole.ASSISTANT).length;

  return (
    <Card className="border-2 hover:shadow-xl transition-all">
      {showHeader && (
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="text-base">
                {description || `Full record of your practice session (${userMessages} from you, ${aiMessages} from AI)`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className={cn('space-y-4 overflow-y-auto pr-2', `max-h-[${maxHeight}]`)} style={{ maxHeight }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === MessageRole.ASSISTANT && (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'p-4 rounded-2xl max-w-[75%] shadow-sm',
                  msg.role === MessageRole.USER
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                    : 'bg-muted border-2'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold opacity-70">
                    {msg.role === MessageRole.USER ? 'You' : 'AI Assistant'}
                  </p>
                  <span className="text-xs opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === MessageRole.USER && (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

