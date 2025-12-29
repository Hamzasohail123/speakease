'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { formatDuration } from '@ai-english-speaker/shared';

interface SessionTimerProps {
  duration: number; // in minutes
  onEnd: () => void;
  sessionId: string;
}

export function SessionTimer({ duration, onEnd, sessionId }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
              <p className="text-xs text-muted-foreground">Time remaining</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEnd}>
            End Session
          </Button>
        </div>
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

