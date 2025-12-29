'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { feedbackApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Send, Loader2, CheckCircle } from 'lucide-react';

const feedbackSchema = z.object({
  type: z.enum(['feedback', 'suggestion', 'bug', 'feature', 'other'], {
    required_error: 'Please select a feedback type',
  }),
  message: z.string().min(10, 'Please provide at least 10 characters').max(1000, 'Message is too long (max 1000 characters)'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const feedbackType = watch('type');

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      // Submit feedback via API
      await feedbackApi.submitUserFeedback({
        type: data.type,
        message: data.message,
        userEmail: user?.email,
        userName: user?.name,
      });
      
      // Show success message
      setIsSubmitted(true);
      reset();
      
      toast({
        title: 'Feedback submitted!',
        description: 'Thank you for your feedback. We appreciate your input!',
      });

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-8">
            <div className="h-16 w-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                Your feedback has been submitted. We appreciate your input!
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="mt-4"
            >
              Submit Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:shadow-xl transition-all">
      <CardHeader>
        <CardTitle className="text-2xl">Share Your Thoughts</CardTitle>
        <CardDescription className="text-base">
          Help us improve SpeakEase by sharing your feedback, suggestions, or reporting issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base font-semibold">
              Feedback Type
            </Label>
            <Select
              value={feedbackType}
              onValueChange={(value) => setValue('type', value as FeedbackFormData['type'])}
            >
              <SelectTrigger className="h-12 text-base border-2">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feedback">💬 General Feedback</SelectItem>
                <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                <SelectItem value="bug">🐛 Bug Report</SelectItem>
                <SelectItem value="feature">✨ Feature Request</SelectItem>
                <SelectItem value="other">📝 Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-base font-semibold">
              Your Message
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us what you think... Share your experience, suggestions, or any issues you've encountered."
              className="min-h-[200px] text-base border-2"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {watch('message')?.length || 0} / 1000 characters
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border-2 border-primary/10">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Your feedback will be sent directly to our team. 
              {user ? ` Submitting as ${user.name || user.email}.` : ' You can optionally provide your email for a response.'}
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-base bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

