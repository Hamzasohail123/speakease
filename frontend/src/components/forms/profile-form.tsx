'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

const profileSchema = z.object({
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  goals: z.array(z.string()).max(10, 'Maximum 10 goals').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  const updateMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      goals: [],
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio || '',
        goals: profile.goals || [],
      });
    }
  }, [profile, reset]);

  const goals = watch('goals') || [];
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (newGoal.trim() && goals.length < 10) {
      setValue('goals', [...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setValue(
      'goals',
      goals.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate({
      bio: data.bio,
      goals: data.goals,
    });
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Tell us about yourself and your learning goals</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              rows={4}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This helps the AI understand you better
            </p>
          </div>

          <div className="space-y-2">
            <Label>Learning Goals</Label>
            <div className="flex gap-2">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a goal..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGoal();
                  }
                }}
              />
              <Button type="button" onClick={addGoal} disabled={goals.length >= 10}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {goals.length > 0 && (
              <div className="space-y-2 mt-2">
                {goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="text-sm">{goal}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {goals.length}/10 goals
            </p>
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

