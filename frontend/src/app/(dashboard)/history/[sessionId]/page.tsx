'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi, feedbackApi } from '@/lib/api';
import { formatDateTime, MessageRole } from '@ai-english-speaker/shared';
import { Loader2, History, Clock, Calendar, MessageSquare, User, Bot, Sparkles, ArrowLeft, TrendingUp } from 'lucide-react';
import { FeedbackDisplay } from '@/components/feedback/feedback-display';
import { cn } from '@/lib/utils';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: () => sessionsApi.getById(sessionId),
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['conversation', sessionId, 'messages'],
    queryFn: () => sessionsApi.getTranscript(sessionId),
    enabled: !!session,
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['feedback', sessionId],
    queryFn: () => feedbackApi.get(sessionId),
    enabled: !!session && session.status === 'ENDED',
  });

  if (sessionLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading session details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Session not found</h2>
          <p className="text-muted-foreground mb-6">This session may have been deleted or doesn't exist.</p>
          <Button onClick={() => router.push('/history')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const messageCount = messages?.length || 0;
  const userMessages = messages?.filter(m => m.role === MessageRole.USER).length || 0;
  const aiMessages = messages?.filter(m => m.role === MessageRole.ASSISTANT).length || 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/history')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <History className="h-4 w-4" />
              Session Details
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Practice Session
            </h1>
            <p className="text-xl text-muted-foreground">
              {formatDateTime(session.startedAt)}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{session.duration}</div>
              <p className="text-xs text-muted-foreground mt-1">minutes</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{messageCount}</div>
              <p className="text-xs text-muted-foreground mt-1">exchanges</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={session.status === 'ENDED' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {session.status}
              </Badge>
              {session.endedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDateTime(session.endedAt)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Started</CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {new Date(session.startedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(session.startedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Transcript */}
        {messagesLoading ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading conversation...</p>
            </CardContent>
          </Card>
        ) : messages && messages.length > 0 ? (
          <Card className="border-2 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Session Transcript</CardTitle>
                  <CardDescription className="text-base">
                    Full record of your practice session - includes both chat and real-time call messages ({userMessages} from you, {aiMessages} from AI)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.map((msg, index) => (
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
        ) : (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No messages in this session</p>
            </CardContent>
          </Card>
        )}

        {/* AI Feedback */}
        {session.status === 'ENDED' && (
          <>
            {feedbackLoading ? (
              <Card className="border-2">
                <CardContent className="py-12 text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Analyzing your performance...</p>
                </CardContent>
              </Card>
            ) : feedback ? (
              <FeedbackDisplay feedback={feedback} sessionId={sessionId} />
            ) : (
              <Card className="border-2">
                <CardContent className="py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No feedback available for this session</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

