'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SessionStarter } from '@/components/sessions/session-starter';
import { Mic, Sparkles } from 'lucide-react';

export default function SpeakPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Mic className="h-4 w-4" />
            Voice Practice Session
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Start Speaking
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your session duration and topic to begin practicing with your AI conversation partner
          </p>
        </div>

        {/* Session Starter Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur-xl"></div>
          <div className="relative">
            <SessionStarter />
          </div>
        </div>

        {/* Tips Section */}
        <div className="grid gap-4 md:grid-cols-3 mt-12">
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Natural Conversation</h3>
            <p className="text-sm text-muted-foreground">
              Speak naturally and the AI will adapt to your level
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <Mic className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Voice or Text</h3>
            <p className="text-sm text-muted-foreground">
              Choose between voice call or text chat mode
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Instant Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered feedback after each session
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

