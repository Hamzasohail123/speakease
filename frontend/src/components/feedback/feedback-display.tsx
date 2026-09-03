'use client';

import { Feedback } from '@ai-english-speaker/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Lightbulb, AlertTriangle, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { TranscriptDisplay } from '@/components/conversation/transcript-display';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api';

interface FeedbackDisplayProps {
  feedback: Feedback;
  sessionId: string;
}

export function FeedbackDisplay({ feedback, sessionId }: FeedbackDisplayProps) {
  const hasMistakes = feedback.mistakes && feedback.mistakes.length > 0;
  const hasImprovements = feedback.improvements && feedback.improvements.length > 0;
  const hasTips = feedback.tips && feedback.tips.length > 0;

  // Fetch transcript for this session
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['conversation', sessionId, 'messages'],
    queryFn: () => sessionsApi.getTranscript(sessionId),
    enabled: !!sessionId,
  });

  // Debug logging
  if (messagesError) {
    console.error('[FeedbackDisplay] Error fetching transcript:', messagesError);
  }
  if (messages) {
    console.log('[FeedbackDisplay] Messages received:', messages.length, messages);
  }

  return (
    <div className="space-y-6">
      {/* Conversation Transcript Section */}
      {messagesLoading ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading conversation transcript...</p>
          </CardContent>
        </Card>
      ) : messages && messages.length > 0 ? (
        <TranscriptDisplay
          messages={messages}
          title="Real-Time Call Transcript"
          description={`Complete record of your real-time call with AI (${messages.filter(m => m.role === 'USER').length} from you, ${messages.filter(m => m.role === 'ASSISTANT').length} from AI)`}
          maxHeight="500px"
        />
      ) : messagesError ? (
        <Card className="border-2 border-red-200">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-red-600">Error loading transcript: {messagesError instanceof Error ? messagesError.message : 'Unknown error'}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No transcript available for this session</p>
            <p className="text-xs text-muted-foreground mt-2">Messages will appear here after your call ends</p>
          </CardContent>
        </Card>
      )}
      {/* Header Card */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Feedback & Analysis</CardTitle>
              <CardDescription className="text-base">
                Personalized insights to improve your English speaking
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mistakes Section */}
      {hasMistakes && (
        <Card className="border-2 hover:shadow-xl transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Areas to Improve</CardTitle>
                <CardDescription>
                  {feedback.mistakes.length} {feedback.mistakes.length === 1 ? 'mistake' : 'mistakes'} identified
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedback.mistakes.map((mistake, index) => (
                <div 
                  key={index} 
                  className="p-5 border-2 rounded-xl bg-gradient-to-br from-red-500/5 to-orange-500/5 hover:border-red-500/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="destructive"
                      className="text-xs font-semibold"
                    >
                      {mistake.category}
                    </Badge>
                    {mistake.frequency > 1 && (
                      <Badge variant="outline" className="text-xs">
                        <span className="text-orange-600 font-semibold">
                          ×{mistake.frequency}
                        </span>
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
                    {mistake.explanation}
                  </p>
                  
                  <div className="space-y-3 bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    {mistake.incorrect && (
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-600 mb-1">Incorrect</p>
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">
                            &quot;{mistake.incorrect}&quot;
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {mistake.correct && (
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-600 mb-1">Correct</p>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            &quot;{mistake.correct}&quot;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvements Section */}
      {hasImprovements && (
        <Card className="border-2 hover:shadow-xl transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Great Progress!</CardTitle>
                <CardDescription>
                  Things you're doing well
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.improvements.map((improvement, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-2 border-green-500/10 hover:border-green-500/30 transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm leading-relaxed pt-1">{improvement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      {hasTips && (
        <Card className="border-2 hover:shadow-xl transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Tips for Next Time</CardTitle>
                <CardDescription>
                  Recommendations to enhance your practice
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.tips.map((tip, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-2 border-yellow-500/10 hover:border-yellow-500/30 transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-sm leading-relaxed pt-1">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!hasMistakes && !hasImprovements && !hasTips && (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No detailed feedback available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

