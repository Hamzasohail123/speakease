'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { topicsApi } from '@/lib/api';
import { Topic } from '@ai-english-speaker/shared';
import { Loader2, Sparkles, Target, Shuffle, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function TopicsPage() {
  const router = useRouter();

  const { data: topics, isLoading } = useQuery({
    queryKey: ['topics', 'all'],
    queryFn: () => topicsApi.getAll(),
  });

  const { data: dailyTopic } = useQuery({
    queryKey: ['topics', 'daily'],
    queryFn: () => topicsApi.getDaily(),
  });

  const { data: randomTopic } = useQuery({
    queryKey: ['topics', 'random'],
    queryFn: () => topicsApi.getRandom(),
  });

  const handleStartSession = (topicId: string) => {
    router.push(`/speak?topicId=${topicId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading topics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Target className="h-4 w-4" />
            Conversation Topics
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Choose Your Topic
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a conversation topic to practice and improve your English speaking skills
          </p>
        </div>

        {/* Featured Topics */}
        {(dailyTopic || randomTopic) && (
          <div className="grid gap-6 md:grid-cols-2">
            {dailyTopic && (
              <Card className="border-2 border-primary hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Daily Topic
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{dailyTopic.name}</CardTitle>
                  <CardDescription className="text-base">
                    {dailyTopic.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyTopic.category && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {dailyTopic.category}
                      </Badge>
                    </div>
                  )}
                  <Button
                    onClick={() => handleStartSession(dailyTopic.id)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            )}

            {randomTopic && (
              <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Shuffle className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-500">
                      <Shuffle className="h-3 w-3 mr-1" />
                      Random Pick
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{randomTopic.name}</CardTitle>
                  <CardDescription className="text-base">
                    {randomTopic.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {randomTopic.category && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {randomTopic.category}
                      </Badge>
                    </div>
                  )}
                  <Button
                    onClick={() => handleStartSession(randomTopic.id)}
                    variant="outline"
                    size="lg"
                    className="w-full border-2 hover:border-primary"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Try This Topic
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* All Topics */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">All Topics</h2>
              <p className="text-sm text-muted-foreground">Browse all available conversation topics</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topics?.map((topic: Topic, index) => (
              <Card 
                key={topic.id} 
                className={cn(
                  "hover:shadow-lg transition-all hover:border-primary/50 border-2 group cursor-pointer",
                )}
                onClick={() => handleStartSession(topic.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      index % 3 === 0 && "bg-blue-500/10",
                      index % 3 === 1 && "bg-purple-500/10",
                      index % 3 === 2 && "bg-green-500/10"
                    )}>
                      <MessageSquare className={cn(
                        "h-5 w-5",
                        index % 3 === 0 && "text-blue-500",
                        index % 3 === 1 && "text-purple-500",
                        index % 3 === 2 && "text-green-500"
                      )} />
                    </div>
                    {topic.category && (
                      <Badge variant="outline" className="text-xs">
                        {topic.category}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {topic.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {topic.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    size="sm"
                  >
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

