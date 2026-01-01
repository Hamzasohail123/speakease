'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CallWithAIProps {
  sessionId: string;
}

type CallState = 'idle' | 'ringing' | 'connecting' | 'in-call' | 'ended';

export function CallWithAI({ sessionId }: CallWithAIProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const ringToneRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    
    // Try to load ring tone, but handle if file doesn't exist
    ringToneRef.current = new Audio('/audio/ring-tone.mp3');
    ringToneRef.current.loop = true;
    ringToneRef.current.onerror = () => {
      console.warn('Ring tone file not found, using fallback');
      // Will use beep sound as fallback
    };

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (ringToneRef.current) {
        ringToneRef.current.pause();
        ringToneRef.current = null;
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callState === 'in-call') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [callState]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate simple beep sound (fallback for missing audio files)
  const playBeep = (frequency: number, duration: number) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  // Start call
  const startCall = async () => {
    try {
      setCallState('ringing');

      // Play ring tone or fallback beep
      if (ringToneRef.current) {
        ringToneRef.current.play().catch((err) => {
          console.warn('Ring tone not available, using beep fallback:', err);
          // Generate simple beep as fallback
          playBeep(800, 200);
        });
      } else {
        // Fallback beep
        playBeep(800, 200);
      }

      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Get API URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Connect to WebSocket
      const wsUrl = `${API_URL.replace('http', 'ws')}/api/v1/conversation/realtime/ws?sessionId=${sessionId}&token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setCallState('connecting');

        // Stop ring tone after 2-3 seconds (simulate AI answering)
        setTimeout(() => {
          if (ringToneRef.current) {
            ringToneRef.current.pause();
            ringToneRef.current.currentTime = 0;
          }
          // Play connection beep
          playBeep(1000, 100);
          setCallState('in-call');
          setCallDuration(0);

          // Start audio capture
          startAudioCapture();
        }, 2000);
      };

      ws.onmessage = (event) => {
        // Handle messages from OpenAI Realtime API
        try {
          // OpenAI Realtime API sends JSON messages
          if (typeof event.data === 'string') {
            const data = JSON.parse(event.data);
            handleRealtimeMessage(data);
          } else {
            // Binary data (shouldn't happen with Realtime API, but handle it)
            console.warn('Received binary data, expected JSON');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to AI. Please check your connection and try again.',
          variant: 'destructive',
        });
        setCallState('idle');
        if (ringToneRef.current) {
          ringToneRef.current.pause();
          ringToneRef.current.currentTime = 0;
        }
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (event.code !== 1000 && event.code !== 1001) {
          // Not a normal closure
          toast({
            title: 'Connection Closed',
            description: event.reason || 'Connection was closed unexpectedly',
            variant: 'destructive',
          });
        }
        endCall();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start call',
        variant: 'destructive',
      });
      setCallState('idle');
    }
  };

      // Handle Realtime API messages
      const handleRealtimeMessage = async (data: any) => {
        // Handle different message types from OpenAI Realtime API
        switch (data.type) {
          case 'response.audio.delta':
            // AI is speaking - audio chunk received
            setIsAISpeaking(true);
            setIsUserSpeaking(false);
            // Play audio chunk if present
            if (data.delta && audioContextRef.current) {
              await playAudioChunk(data.delta);
            }
            break;

          case 'response.audio.done':
            // AI finished speaking
            setIsAISpeaking(false);
            break;

          case 'input_audio_buffer.speech_started':
            // User started speaking
            setIsUserSpeaking(true);
            setIsAISpeaking(false);
            break;

          case 'input_audio_buffer.speech_stopped':
            // User stopped speaking
            setIsUserSpeaking(false);
            break;

          case 'session.created':
            console.log('Session created:', data);
            break;

          case 'session.updated':
            console.log('Session updated:', data);
            break;

          case 'error':
            console.error('OpenAI Realtime API error:', data);
            toast({
              title: 'AI Error',
              description: data.error?.message || data.error || 'An error occurred during the call',
              variant: 'destructive',
            });
            // Don't end call on error, let user decide
            break;

          default:
            // Log unknown message types for debugging
            if (data.type && !data.type.startsWith('conversation.')) {
              console.debug('Unknown message type:', data.type, data);
            }
        }
      };

  // Play audio chunk from base64 or ArrayBuffer
  const playAudioChunk = async (audioData: string | ArrayBuffer) => {
    if (!audioContextRef.current) return;

    try {
      let audioBuffer: AudioBuffer;

      if (typeof audioData === 'string') {
        // Base64 encoded audio
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      } else {
        // ArrayBuffer
        audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (error) {
      console.error('Error playing audio chunk:', error);
    }
  };

  // Start audio capture
  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 24000, // OpenAI Realtime API uses 24kHz
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      mediaStreamRef.current = stream;

      // Create audio context for processing
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert to PCM16 and send via WebSocket
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          
          // Send as input_audio_buffer.append event
          const message = {
            type: 'input_audio_buffer.append',
            audio: Array.from(pcm16).map((v) => v.toString(16).padStart(4, '0')).join(''), // Convert to hex string
          };
          wsRef.current.send(JSON.stringify(message));
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
    } catch (error) {
      console.error('Error starting audio capture:', error);
      toast({
        title: 'Microphone Error',
        description: 'Failed to access microphone. Please check permissions.',
        variant: 'destructive',
      });
      endCall();
    }
  };

  // End call
  const endCall = () => {
    // Play end call beep
    playBeep(600, 150);

    // Stop ring tone
    if (ringToneRef.current) {
      ringToneRef.current.pause();
      ringToneRef.current.currentTime = 0;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Reset state
    setCallState('ended');
    setIsAISpeaking(false);
    setIsUserSpeaking(false);

    // Show call ended message
    setTimeout(() => {
      setCallState('idle');
      setCallDuration(0);
    }, 3000);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardContent className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        {/* Call State Display */}
        {callState === 'idle' && (
          <>
            <div className="flex flex-col items-center space-y-6">
              <Button
                onClick={startCall}
                size="lg"
                className="h-32 w-32 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Phone className="h-16 w-16" />
              </Button>
              <p className="text-lg text-muted-foreground">Tap to start a call</p>
            </div>
          </>
        )}

        {callState === 'ringing' && (
          <>
            <div className="flex flex-col items-center space-y-6">
              <Button
                size="lg"
                className={cn(
                  'h-32 w-32 rounded-full bg-green-500 text-white shadow-lg animate-pulse'
                )}
                disabled
              >
                <Phone className="h-16 w-16" />
              </Button>
              <p className="text-lg font-semibold">Ringing...</p>
              <Button onClick={endCall} variant="destructive" size="sm">
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>
          </>
        )}

        {callState === 'connecting' && (
          <>
            <div className="flex flex-col items-center space-y-6">
              <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-white/20 animate-pulse" />
              </div>
              <p className="text-lg font-semibold">Connecting...</p>
            </div>
          </>
        )}

        {callState === 'in-call' && (
          <>
            <div className="flex flex-col items-center space-y-6 w-full">
              {/* AI Avatar */}
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                AI
              </div>

              {/* Call Info */}
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold">AI Partner</p>
                <p className="text-lg text-muted-foreground">{formatDuration(callDuration)}</p>
              </div>

              {/* Waveform */}
              <div className="w-full max-w-md h-20 flex items-center justify-center space-x-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 bg-primary rounded-full transition-all',
                      (isAISpeaking || isUserSpeaking) && 'animate-pulse'
                    )}
                    style={{
                      height: isAISpeaking || isUserSpeaking ? `${Math.random() * 60 + 20}%` : '20%',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              {/* Status */}
              <p className="text-sm text-muted-foreground">
                {isAISpeaking && 'AI is speaking...'}
                {isUserSpeaking && 'You are speaking...'}
                {!isAISpeaking && !isUserSpeaking && 'Listening...'}
              </p>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-4">
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? 'destructive' : 'outline'}
                  size="lg"
                  className="rounded-full h-14 w-14"
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button
                  onClick={toggleSpeaker}
                  variant={isSpeakerOn ? 'default' : 'outline'}
                  size="lg"
                  className="rounded-full h-14 w-14"
                >
                  {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                </Button>
                <Button
                  onClick={endCall}
                  variant="destructive"
                  size="lg"
                  className="rounded-full h-14 w-14"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </>
        )}

        {callState === 'ended' && (
          <>
            <div className="flex flex-col items-center space-y-6">
              <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center text-white">
                <PhoneOff className="h-12 w-12" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold">Call ended</p>
                <p className="text-lg text-muted-foreground">
                  Duration: {formatDuration(callDuration)}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

