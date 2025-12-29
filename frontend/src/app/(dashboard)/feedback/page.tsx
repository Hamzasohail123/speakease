'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FeedbackForm } from '@/components/forms/feedback-form';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MessageSquare className="h-4 w-4" />
            Share Your Thoughts
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Feedback & Suggestions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us improve SpeakEase by sharing your thoughts, suggestions, or reporting issues
          </p>
        </div>

        {/* Feedback Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur-xl"></div>
          <div className="relative">
            <FeedbackForm />
          </div>
        </div>

        {/* Info Section */}
        <div className="grid gap-4 md:grid-cols-2 mt-12">
          <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">We Value Your Input</h3>
                <p className="text-sm text-muted-foreground">
                  Your feedback helps us make SpeakEase better for everyone. Every suggestion is carefully reviewed.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quick Response</h3>
                <p className="text-sm text-muted-foreground">
                  We read every submission and respond to important feedback. Your voice matters!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

