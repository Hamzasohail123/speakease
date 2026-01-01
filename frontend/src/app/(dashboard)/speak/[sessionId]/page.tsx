'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ConversationChat } from '@/components/conversation/conversation-chat';
import { VoiceChat } from '@/components/conversation/voice-chat';
import { CallWithAI } from '@/components/conversation/call-with-ai';
import { SessionTimer } from '@/components/sessions/session-timer';
import { useQuery, useMutation } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, MessageSquare, Phone, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ActiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;
  const [mode, setMode] = useState<'text' | 'voice' | 'call'>('voice');

  const { data: session, isLoading } = useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: () => sessionsApi.getById(sessionId),
  });

  const endSessionMutation = useMutation({
    mutationFn: () => sessionsApi.end(sessionId),
    onSuccess: () => {
      toast({
        title: 'Session ended',
        description: 'Your session has been saved',
      });
      router.push('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to end session',
        variant: 'destructive',
      });
    },
  });

  const handleEndSession = () => {
    endSessionMutation.mutate();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Session not found</h2>
          <p className="text-muted-foreground">This session may have been deleted or doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Active Session
          </div>
          <h1 className="text-4xl font-bold">Practice Session</h1>
          <p className="text-lg text-muted-foreground">
            Have a conversation with your AI partner
          </p>
        </div>

        {/* Timer */}
        <div className="flex justify-center">
          <SessionTimer
            duration={session.duration}
            onEnd={handleEndSession}
            sessionId={sessionId}
          />
        </div>

        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'text' | 'voice' | 'call')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 border-2">
            <TabsTrigger 
              value="text" 
              className="flex items-center gap-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <MessageSquare className="h-5 w-5" />
              Text Chat
            </TabsTrigger>
            <TabsTrigger 
              value="voice" 
              className="flex items-center gap-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Mic className="h-5 w-5" />
              Voice Call
            </TabsTrigger>
            <TabsTrigger 
              value="call" 
              className="flex items-center gap-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
            >
              <Phone className="h-5 w-5" />
              Call with AI
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-6">
            <ConversationChat sessionId={sessionId} />
          </TabsContent>
          <TabsContent value="voice" className="mt-6">
            <VoiceChat sessionId={sessionId} />
          </TabsContent>
          <TabsContent value="call" className="mt-6">
            <CallWithAI sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

