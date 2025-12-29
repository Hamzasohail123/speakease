'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatDateTime, SessionStatus } from '@ai-english-speaker/shared';
import { MessageSquare, Clock, History, TrendingUp, Calendar, Loader2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', 'history'],
    queryFn: () => sessionsApi.getHistory(50, 0),
  });

  // Calculate stats
  const totalSessions = sessions?.length || 0;
  const totalMinutes = sessions?.reduce((acc, s) => acc + s.duration, 0) || 0;
  const completedSessions = sessions?.filter(s => s.status === SessionStatus.ENDED).length || 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <History className="h-4 w-4" />
            Practice History
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Your Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your progress and review past practice sessions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedSessions} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMinutes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                minutes practiced
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keep Going!</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                size="sm" 
                className="w-full mt-2"
                onClick={() => router.push('/speak')}
              >
                <Mic className="mr-2 h-4 w-4" />
                Start New Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">All Sessions</h2>
              <p className="text-sm text-muted-foreground">
                {totalSessions} practice {totalSessions === 1 ? 'session' : 'sessions'}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid gap-4">
              {sessions.map((session, index) => (
                <Card 
                  key={session.id}
                  className={cn(
                    "hover:shadow-lg transition-all hover:border-primary/50 border-2 group cursor-pointer",
                    index === 0 && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => router.push(`/history/${session.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-14 w-14 rounded-lg flex flex-col items-center justify-center",
                          index % 3 === 0 && "bg-gradient-to-br from-blue-500 to-cyan-500",
                          index % 3 === 1 && "bg-gradient-to-br from-purple-500 to-pink-500",
                          index % 3 === 2 && "bg-gradient-to-br from-green-500 to-emerald-500"
                        )}>
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Practice Session
                            {index === 0 && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                                Latest
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(session.startedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.duration} min
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="opacity-0 group-hover:opacity-100 transition-all border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2">
              <CardContent className="py-16 text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mx-auto flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No Sessions Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Start your first practice session and begin your English learning journey!
                  </p>
                </div>
                <Button 
                  size="lg"
                  onClick={() => router.push('/speak')}
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Your First Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

