'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Mic, MessageSquare, TrendingUp, Target, Zap, CheckCircle, ArrowRight, Bot, Mail, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';


export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                SpeakEase
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost">
                <Link href="/login">{isAuthenticated ? "Dashboard" : "Login"}</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered English Learning
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Master English Through
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Real Conversations
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Practice speaking English with an AI partner that adapts to your level, 
              remembers your progress, and provides instant feedback
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                <Link href="/register">
                  Start Practicing Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-2 hover:border-primary">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">24/7</div>
                <p className="text-sm text-muted-foreground mt-1">Available Anytime</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">AI</div>
                <p className="text-sm text-muted-foreground mt-1">Powered Learning</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">∞</div>
                <p className="text-sm text-muted-foreground mt-1">Topics to Explore</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <Badge className="bg-gradient-to-r from-primary to-purple-500">
                <Zap className="h-3 w-3 mr-1" />
                Key Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Everything You Need to
                <br />
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Improve Your English
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mic className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Voice Conversations</CardTitle>
                  <CardDescription className="text-base">
                    Practice speaking naturally with real-time voice interactions. Choose between voice or text mode.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bot className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Smart AI Partner</CardTitle>
                  <CardDescription className="text-base">
                    AI adapts to your level and provides natural, engaging conversations on any topic.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Instant Feedback</CardTitle>
                  <CardDescription className="text-base">
                    Get detailed analysis of your mistakes, grammar tips, and personalized improvement suggestions.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 4 */}
              <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Diverse Topics</CardTitle>
                  <CardDescription className="text-base">
                    Practice with hundreds of conversation topics across different categories and difficulty levels.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 5 */}
              <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Session History</CardTitle>
                  <CardDescription className="text-base">
                    Review past conversations, track progress, and revisit feedback to see how much you've improved.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 6 */}
              <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Personalized Learning</CardTitle>
                  <CardDescription className="text-base">
                    AI remembers your goals, interests, and progress to create a truly personalized learning experience.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <Badge className="bg-gradient-to-r from-primary to-purple-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Simple Process
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Start Speaking in
                <br />
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Three Easy Steps
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold">Sign Up Free</h3>
                <p className="text-muted-foreground">
                  Create your account in seconds. No credit card required.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold">Choose a Topic</h3>
                <p className="text-muted-foreground">
                  Pick from hundreds of topics or start a free conversation.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold">Start Practicing</h3>
                <p className="text-muted-foreground">
                  Begin your conversation and get instant AI feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {' '}Improve Your English?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of learners practicing English with AI. Start your journey today!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                <Link href="/register">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Heart className="h-4 w-4" />
                Share Your Experience
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                We'd Love to
                <br />
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Hear From You
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have feedback, suggestions, or want to share your learning journey? We're all ears!
              </p>
            </div>

            <Card className="border-2 hover:shadow-xl transition-all max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-500 mx-auto flex items-center justify-center">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Get in Touch</h3>
                    <a 
                      href="mailto:hamzasohail429@gmail.com"
                      className="text-primary hover:underline text-lg font-medium"
                    >
                      hamzasohail429@gmail.com
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send us your thoughts, feedback, or success stories!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">SpeakEase</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SpeakEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
