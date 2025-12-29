'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi, topicsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, TrendingUp, Sparkles, Mic, History, Target } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();

  const { data: recentSessions } = useQuery({
    queryKey: ['sessions', 'history'],
    queryFn: () => sessionsApi.getHistory(5, 0),
  });

  const { data: dailyTopic } = useQuery({
    queryKey: ['topics', 'daily'],
    queryFn: () => topicsApi.getDaily(),
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered English Practice
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome Back!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to improve your English speaking skills? Start a conversation with your AI partner.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recentSessions?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Practice sessions completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Topic</CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold line-clamp-2">
                {dailyTopic?.name || 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Today's featured topic
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary bg-primary text-primary-foreground hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Start</CardTitle>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Mic className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-white text-primary hover:bg-white/90">
                <Link href="/speak">Start Session Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Topic - Featured Card */}
          <Card className="lg:col-span-2 border-2 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Daily Topic</CardTitle>
                  <CardDescription>Today's conversation topic</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dailyTopic ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                    <h3 className="text-2xl font-bold mb-2">{dailyTopic.name}</h3>
                    {dailyTopic.description && (
                      <p className="text-muted-foreground">{dailyTopic.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={() => router.push(`/speak?topicId=${dailyTopic.id}`)}
                    >
                      <Mic className="mr-2 h-5 w-5" />
                      Practice This Topic
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => router.push('/topics')}
                    >
                      Browse All Topics
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Loading topic...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="border-2 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <History className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Your practice history</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions && recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session, index) => (
                    <div
                      key={session.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border-2 hover:border-primary/50 transition-all cursor-pointer group',
                        index === 0 && 'bg-primary/5 border-primary/20'
                      )}
                      onClick={() => router.push(`/history/${session.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {session.duration}m
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {new Date(session.startedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.startedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push('/history')}
                  >
                    View All Sessions
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No sessions yet. Start your first practice session!
                  </p>
                  <Button size="sm" onClick={() => router.push('/speak')}>
                    Start Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/speak')}>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Free Conversation</h3>
                  <p className="text-sm text-muted-foreground">Talk about anything</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/topics')}>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Browse Topics</h3>
                  <p className="text-sm text-muted-foreground">Choose your focus</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/history')}>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <History className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">View Progress</h3>
                  <p className="text-sm text-muted-foreground">Track your journey</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

