'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { conversationApi } from '@/lib/api';
import { Message, MessageRole } from '@ai-english-speaker/shared';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConversationChatProps {
  sessionId: string;
}

export function ConversationChat({ sessionId }: ConversationChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load existing messages
  const { data: existingMessages } = useQuery({
    queryKey: ['conversation', sessionId, 'messages'],
    queryFn: () => conversationApi.getMessages(sessionId),
  });

  useEffect(() => {
    if (existingMessages) {
      setMessages(existingMessages);
    }
  }, [existingMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => conversationApi.sendMessage(sessionId, content),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data.userMessage, data.assistantMessage]);
      setMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Start the conversation by sending a message!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3',
                    msg.role === MessageRole.USER
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isPending}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

