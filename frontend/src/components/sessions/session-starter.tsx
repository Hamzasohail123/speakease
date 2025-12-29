'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sessionsApi, topicsApi } from '@/lib/api';
import { SESSION_DURATIONS } from '@ai-english-speaker/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, X, Clock, Target, Mic } from 'lucide-react';

export function SessionStarter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [duration, setDuration] = useState<number>(10);
  const [topicId, setTopicId] = useState<string | undefined>();

  // Check for active session
  const { data: activeSession } = useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: async () => {
      // Try to get active session from history (first one should be active if exists)
      const sessions = await sessionsApi.getHistory(1, 0);
      const active = sessions.find(s => s.status === 'ACTIVE');
      return active || null;
    },
    retry: false,
  });

  // Set topicId from URL params on mount
  useEffect(() => {
    const urlTopicId = searchParams?.get('topicId');
    if (urlTopicId) {
      setTopicId(urlTopicId);
    }
  }, [searchParams]);

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicsApi.getAll(),
  });

  const { data: dailyTopic } = useQuery({
    queryKey: ['topics', 'daily'],
    queryFn: () => topicsApi.getDaily(),
  });

  const endActiveSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsApi.end(sessionId),
    onSuccess: () => {
      toast({
        title: 'Session ended',
        description: 'You can now start a new session',
      });
      // Refetch active session
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to end session',
        variant: 'destructive',
      });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: sessionsApi.start,
    onSuccess: (session) => {
      router.push(`/speak/${session.id}`);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start session';
      if (errorMessage.includes('already has an active session')) {
        // Refetch to show the active session alert
        window.location.reload();
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleStart = () => {
    startSessionMutation.mutate({
      duration,
      topicId: topicId || undefined,
    });
  };

  return (
    <Card className="border-2 hover:shadow-xl transition-all">
      <CardHeader>
        <CardTitle className="text-2xl">Start a Practice Session</CardTitle>
        <CardDescription className="text-base">Choose duration and topic to begin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeSession && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Active Session Found</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                You already have an active session. Please end it before starting a new one.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/speak/${activeSession.id}`)}
                >
                  Continue Session
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => endActiveSessionMutation.mutate(activeSession.id)}
                  disabled={endActiveSessionMutation.isPending}
                >
                  {endActiveSessionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ending...
                    </>
                  ) : (
                    'End Session'
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            Duration
          </label>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
          >
            <SelectTrigger className="h-12 text-base border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_DURATIONS.map((dur) => (
                <SelectItem key={dur} value={dur.toString()}>
                  {dur} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-500" />
            </div>
            Topic (Optional)
          </label>
          <Select
            value={topicId || 'random'}
            onValueChange={(value) => setTopicId(value === 'random' ? undefined : value)}
          >
            <SelectTrigger className="h-12 text-base border-2">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">🎲 Random Topic</SelectItem>
              {dailyTopic && (
                <SelectItem value={dailyTopic.id}>
                  ⭐ {dailyTopic.name} (Daily)
                </SelectItem>
              )}
              {topicsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading topics...
                </SelectItem>
              ) : (
                topics?.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleStart}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 h-14 text-base"
          disabled={startSessionMutation.isPending}
        >
          {startSessionMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" />
              Start Session
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

