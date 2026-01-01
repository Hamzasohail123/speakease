'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { conversationApi } from '@/lib/api';
import { Message, MessageRole } from '@ai-english-speaker/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceChatProps {
  sessionId: string;
}

interface VoiceMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  audioUrl?: string; // For AI responses
}

export function VoiceChat({ sessionId }: VoiceChatProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Load existing messages
  const { data: existingMessages } = useQuery({
    queryKey: ['conversation', sessionId, 'messages'],
    queryFn: () => conversationApi.getMessages(sessionId),
  });

  // Convert existing messages to VoiceMessage format
  useEffect(() => {
    if (existingMessages) {
      const voiceMessages: VoiceMessage[] = existingMessages.map((msg: Message) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
      setMessages(voiceMessages);
    }
  }, [existingMessages]);

  // Send voice message mutation
  const sendVoiceMutation = useMutation({
    mutationFn: (audioBlob: Blob) => conversationApi.sendVoiceMessage(sessionId, audioBlob),
    onSuccess: (data) => {
      // Reset processing state immediately
      setIsProcessing(false);
      
      // Create audio URL for AI response
      const audioUrl = data.audio
        ? `data:audio/${data.audioFormat || 'mp3'};base64,${data.audio}`
        : undefined;

      // Add messages with audio URL for AI response
      const userVoiceMsg: VoiceMessage = {
        id: data.userMessage.id,
        role: MessageRole.USER,
        content: data.userMessage.content,
        timestamp: data.userMessage.timestamp,
      };

      const aiVoiceMsg: VoiceMessage = {
        id: data.assistantMessage.id,
        role: MessageRole.ASSISTANT,
        content: data.assistantMessage.content,
        timestamp: data.assistantMessage.timestamp,
        audioUrl: audioUrl,
      };

      setMessages((prev) => [...prev, userVoiceMsg, aiVoiceMsg]);
      
      // Automatically play AI audio response
      if (audioUrl) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          playAudioResponse(audioUrl, data.assistantMessage.id);
        }, 100);
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error('Voice message error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send voice message';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsPlaying(false);
      setPlayingMessageId(null);
    };
    audioRef.current.onerror = () => {
      setIsPlaying(false);
      setPlayingMessageId(null);
      toast({
        title: 'Error',
        description: 'Failed to play audio response',
        variant: 'destructive',
      });
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        
        console.log('Recording stopped, audio size:', audioBlob.size, 'bytes');
        
        if (audioBlob.size > 0) {
          setIsProcessing(true);
          console.log('Sending voice message to backend...');
          sendVoiceMutation.mutate(audioBlob);
        } else {
          toast({
            title: 'Error',
            description: 'No audio recorded. Please try again.',
            variant: 'destructive',
          });
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudioResponse = (audioUrl: string, messageId: string) => {
    if (!audioRef.current) return;

    try {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      setPlayingMessageId(messageId);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setPlayingMessageId(null);
    }
  };

  const handlePlayAudio = (messageId: string, audioUrl: string) => {
    if (isPlaying && playingMessageId === messageId) {
      // Stop if already playing this message
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingMessageId(null);
    } else {
      playAudioResponse(audioUrl, messageId);
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Click the microphone to start speaking!</p>
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
                {msg.role === MessageRole.USER ? (
                  // User message - show briefly as "You said: ..."
                  <div className="max-w-[80%] rounded-lg p-3 bg-primary text-primary-foreground">
                    <p className="text-xs opacity-80 mb-1">You said:</p>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ) : (
                  // AI message - show as voice bubble with play button
                  <div className="max-w-[80%] rounded-lg p-4 bg-muted border-2 border-primary/20">
                    {msg.audioUrl ? (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayAudio(msg.id, msg.audioUrl!)}
                          className={cn(
                            'h-12 w-12 rounded-full',
                            isPlaying && playingMessageId === msg.id && 'bg-primary text-primary-foreground'
                          )}
                        >
                          {isPlaying && playingMessageId === msg.id ? (
                            <Volume2 className="h-6 w-6 animate-pulse" />
                          ) : (
                            <Volume2 className="h-6 w-6" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            {isPlaying && playingMessageId === msg.id
                              ? 'AI is speaking...'
                              : 'Click to hear response'}
                          </p>
                          {/* Show text only on hover or as fallback */}
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">
                              View transcript
                            </summary>
                            <p className="text-sm mt-2 whitespace-pre-wrap">{msg.content}</p>
                          </details>
                        </div>
                      </div>
                    ) : (
                      // Fallback if no audio
                      <div>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Audio not available
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          {(isProcessing || sendVoiceMutation.isPending) && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">Processing your message...</p>
                  <p className="text-xs text-muted-foreground">
                    {isProcessing ? 'Converting speech to text' : 'Getting AI response...'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={handleRecordClick}
          disabled={(isProcessing || sendVoiceMutation.isPending) && !isRecording}
          size="lg"
          className={cn(
            'h-20 w-20 rounded-full',
            isRecording && 'bg-destructive hover:bg-destructive/90 animate-pulse'
          )}
        >
          {isRecording ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">
        {isRecording
          ? 'Recording... Click to stop'
          : isProcessing || sendVoiceMutation.isPending
          ? 'Processing your message...'
          : isPlaying
          ? 'Playing response...'
          : 'Click to speak'}
      </p>
    </div>
  );
}

