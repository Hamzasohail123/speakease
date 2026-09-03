'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/marketing/reveal';
import { Waveform } from '@/components/marketing/waveform';
import {
  Sparkles,
  Mic,
  MessageSquare,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Bot,
  Mail,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice Conversations',
    description:
      'Practice speaking naturally with real-time voice interactions. Choose between voice or text mode.',
    tint: 'from-primary to-indigo-400',
  },
  {
    icon: Bot,
    title: 'Smart AI Partner',
    description: 'AI adapts to your level and provides natural, engaging conversations on any topic.',
    tint: 'from-accent-warm to-orange-400',
  },
  {
    icon: TrendingUp,
    title: 'Instant Feedback',
    description:
      'Get detailed analysis of your mistakes, grammar tips, and personalized improvement suggestions.',
    tint: 'from-teal-500 to-emerald-400',
  },
  {
    icon: Target,
    title: 'Diverse Topics',
    description: 'Practice with hundreds of conversation topics across different categories and difficulty levels.',
    tint: 'from-amber-500 to-yellow-400',
  },
  {
    icon: MessageSquare,
    title: 'Session History',
    description: "Review past conversations, track progress, and revisit feedback to see how much you've improved.",
    tint: 'from-sky-500 to-cyan-400',
  },
  {
    icon: Sparkles,
    title: 'Personalized Learning',
    description: 'AI remembers your goals, interests, and progress to create a truly personalized learning experience.',
    tint: 'from-violet-500 to-primary',
  },
];

const STEPS = [
  { n: 1, title: 'Sign Up Free', description: 'Create your account in seconds. No credit card required.', tint: 'from-primary to-indigo-400' },
  { n: 2, title: 'Choose a Topic', description: 'Pick from hundreds of topics or start a free conversation.', tint: 'from-accent-warm to-orange-400' },
  { n: 3, title: 'Start Practicing', description: 'Begin your conversation and get instant AI feedback.', tint: 'from-teal-500 to-emerald-400' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SpeakEase',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  description:
    'Practice speaking English with an AI partner that adapts to your level, remembers your progress, and gives instant feedback.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">SpeakEase</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost">
                <Link href="/login">{isAuthenticated ? 'Dashboard' : 'Login'}</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
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
        <section className="relative w-full px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.14),transparent)]"
            aria-hidden="true"
          />

          <div className="max-w-5xl mx-auto text-center">
            <Reveal immediate>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                AI-Powered English Learning
              </div>
            </Reveal>

            <Reveal immediate delay={0.08}>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-balance">
                <span className="text-foreground">Master English Through</span>
                <br />
                <span className="text-primary">Real Conversations</span>
              </h1>
            </Reveal>

            <Reveal immediate delay={0.16}>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance">
                Practice speaking English with an AI partner that adapts to your level,
                remembers your progress, and provides instant feedback
              </p>
            </Reveal>

            <Reveal immediate delay={0.24}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button asChild size="lg" className="h-14 px-8 text-lg w-full bg-accent-warm text-accent-warm-foreground hover:bg-accent-warm/90">
                    <Link href="/register">
                      Start Practicing Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-2 w-full hover:border-primary hover:text-primary">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </motion.div>
              </div>
            </Reveal>

            <Reveal immediate delay={0.32}>
              <Waveform className="h-16 mt-14 max-w-md mx-auto" />
            </Reveal>

            <Reveal immediate delay={0.4}>
              <div className="grid grid-cols-3 gap-8 pt-10 max-w-2xl mx-auto">
                <div>
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary">24/7</div>
                  <p className="text-sm text-muted-foreground mt-1">Available Anytime</p>
                </div>
                <div>
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary">AI</div>
                  <p className="text-sm text-muted-foreground mt-1">Powered Learning</p>
                </div>
                <div>
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary">∞</div>
                  <p className="text-sm text-muted-foreground mt-1">Topics to Explore</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-muted/40">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center space-y-4 mb-16">
              <Badge className="bg-primary text-primary-foreground">
                <Zap className="h-3 w-3 mr-1" />
                Key Features
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-balance">
                Everything You Need to
                <br />
                <span className="text-primary">Improve Your English</span>
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <Reveal key={feature.title} delay={(i % 3) * 0.08}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                    <Card className="h-full border-2 hover:border-primary/40 hover:shadow-xl transition-[box-shadow,border-color] group">
                      <CardHeader>
                        <div
                          className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.tint} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <feature.icon className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center space-y-4 mb-16">
              <Badge className="bg-primary text-primary-foreground">
                <CheckCircle className="h-3 w-3 mr-1" />
                Simple Process
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-balance">
                Start Speaking in
                <br />
                <span className="text-primary">Three Easy Steps</span>
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.1} className="text-center space-y-4">
                  <div
                    className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${step.tint} flex items-center justify-center mx-auto`}
                  >
                    <span className="text-3xl font-bold text-white">{step.n}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-primary relative overflow-hidden">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-warm/30 blur-3xl"
            aria-hidden="true"
          />
          <Reveal className="max-w-4xl mx-auto text-center space-y-8 relative">
            <div className="space-y-4">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground text-balance">
                Ready to Improve Your English?
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                Join thousands of learners practicing English with AI. Start your journey today!
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-accent-warm text-accent-warm-foreground hover:bg-accent-warm/90">
                <Link href="/register">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
            </motion.div>

            <p className="text-sm text-primary-foreground/70">
              No credit card required • Free forever • Cancel anytime
            </p>
          </Reveal>
        </section>

        {/* Contact Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Reveal className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Heart className="h-4 w-4" />
                Share Your Experience
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-balance">
                We'd Love to
                <br />
                <span className="text-primary">Hear From You</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have feedback, suggestions, or want to share your learning journey? We're all ears!
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="border-2 hover:shadow-xl transition-shadow max-w-md mx-auto">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary mx-auto flex items-center justify-center">
                      <Mail className="h-8 w-8 text-primary-foreground" />
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
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">SpeakEase</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 SpeakEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
