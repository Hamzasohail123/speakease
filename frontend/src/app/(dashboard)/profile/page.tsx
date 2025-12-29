'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProfileForm } from '@/components/forms/profile-form';
import { User, Target, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <User className="h-4 w-4" />
            Your Profile
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Profile Settings
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your profile and customize your English learning experience
          </p>
        </div>

        {/* Profile Form with Gradient Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur-xl"></div>
          <div className="relative">
            <ProfileForm />
          </div>
        </div>

        {/* Tips Section */}
        <div className="grid gap-4 md:grid-cols-2 mt-12">
          <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Set Your Goals</h3>
                <p className="text-sm text-muted-foreground">
                  Define your learning objectives to get personalized conversation topics and feedback
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Personalized Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Your profile helps the AI tailor conversations to your interests and skill level
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

