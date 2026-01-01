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
        console.log('WebSocket connected to backend proxy');
        setCallState('connecting');
        // Don't start audio capture yet - wait for connection.ready message
      };

      ws.onmessage = async (event) => {
        // Handle messages from OpenAI Realtime API
        try {
          // OpenAI Realtime API sends both JSON and binary (audio) messages
          if (typeof event.data === 'string') {
            // JSON message
            const data = JSON.parse(event.data);
            handleRealtimeMessage(data);
          } else if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
            // Binary audio data from OpenAI
            const size = event.data instanceof ArrayBuffer 
              ? event.data.byteLength 
              : event.data.size;
            console.debug('Received binary audio data:', size, 'bytes');
            
            // Convert to ArrayBuffer if Blob, and create a copy to avoid detachment
            let arrayBuffer: ArrayBuffer;
            if (event.data instanceof Blob) {
              arrayBuffer = await event.data.arrayBuffer();
            } else {
              // Create a copy to avoid ArrayBuffer detachment issues
              arrayBuffer = event.data.slice(0);
            }
            
            // Play the audio chunk
            if (audioContextRef.current && arrayBuffer.byteLength > 0) {
              await playAudioChunk(arrayBuffer);
            }
          } else {
            console.warn('Received unknown data type:', typeof event.data, event.data);
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
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
          case 'response.audio_transcript.delta':
            // AI is generating transcript (text)
            break;

          case 'response.audio_transcript.done':
            // AI finished generating transcript
            console.log('AI transcript:', data.response?.audio_transcript);
            break;

          case 'response.audio.done':
            // AI finished speaking
            setIsAISpeaking(false);
            break;

          case 'response.created':
            // AI started responding
            setIsAISpeaking(true);
            setIsUserSpeaking(false);
            break;

          case 'response.done':
            // AI finished responding
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

          case 'connection.ready':
            // Backend proxy sent connection ready message
            console.log('✅ Connection ready:', data.message);
            // Now the session is fully established and ready for interaction
            if (callState === 'connecting' || callState === 'ringing') {
              if (ringToneRef.current) {
                ringToneRef.current.pause();
                ringToneRef.current.currentTime = 0;
              }
              // Play connection beep
              playBeep(1000, 100);
              setCallState('in-call');
              setCallDuration(0);
              // Start audio capture now that OpenAI session is ready
              startAudioCapture();
            }
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

  // Convert PCM16 to WAV format for Web Audio API
  const pcm16ToWav = (pcm16Data: ArrayBuffer, sampleRate: number = 24000): ArrayBuffer => {
    // Create a copy of the ArrayBuffer to avoid detachment issues
    const pcm16Array = new Int16Array(pcm16Data);
    const length = pcm16Array.length;
    
    // Create new ArrayBuffer for WAV (don't reuse the input buffer)
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (1 = PCM)
    view.setUint16(22, 1, true); // num channels
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Copy PCM data to new buffer
    const wavData = new Int16Array(buffer, 44);
    wavData.set(pcm16Array);
    
    return buffer;
  };

  // Play audio chunk from base64 or ArrayBuffer
  const playAudioChunk = async (audioData: string | ArrayBuffer) => {
    if (!audioContextRef.current) {
      console.warn('AudioContext not available');
      return;
    }

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
        // OpenAI sends PCM16 audio - convert to WAV first
        try {
          // Try direct decode first (in case it's already WAV/MP3)
          audioBuffer = await audioContextRef.current.decodeAudioData(audioData.slice(0)); // Create copy
        } catch (decodeError) {
          // If decode fails, assume it's PCM16 and convert to WAV
          console.debug('Decode failed, converting PCM16 to WAV:', decodeError);
          
          // Create a copy of the ArrayBuffer to avoid detachment
          const audioDataCopy = audioData.slice(0);
          const wavBuffer = pcm16ToWav(audioDataCopy, 24000); // OpenAI uses 24kHz
          audioBuffer = await audioContextRef.current.decodeAudioData(wavBuffer);
        }
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      
      setIsAISpeaking(true);
    } catch (error) {
      console.error('Error playing audio chunk:', error);
      setIsAISpeaking(false);
    }
  };

  // Start audio capture
  const startAudioCapture = async () => {
    try {
      // CRITICAL: Capture audio with EXACT specifications for OpenAI Realtime API
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Mono (1 channel)
          sampleRate: 24000, // 24kHz sample rate (REQUIRED)
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      // Create audio context with EXACT sample rate
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      // Use 4096 buffer size (standard for real-time audio)
      // This will create 4096 samples * 2 bytes = 8192 bytes (even number)
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      // Throttle audio sending to prevent overwhelming OpenAI's server
      let lastSendTime = 0;
      const minInterval = 20; // Minimum 20ms between sends (50 chunks per second max)

      processor.onaudioprocess = (e) => {
        if (!isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
          const now = Date.now();
          // Throttle to prevent sending too fast
          if (now - lastSendTime < minInterval) {
            return; // Skip this chunk if sending too fast
          }
          lastSendTime = now;
          
          // Get Float32 audio data (range: -1.0 to 1.0)
          const inputData = e.inputBuffer.getChannelData(0); // Float32Array, mono
          
          // CRITICAL: Convert Float32 to Int16 PCM16 (little-endian)
          // OpenAI requires: 16-bit Linear PCM, 24000Hz, mono, little-endian
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            // Clamp to [-1, 1] range
            const s = Math.max(-1, Math.min(1, inputData[i]));
            // Convert to Int16: negative values use 0x8000, positive use 0x7FFF
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // Send raw PCM16 binary data directly from Int16Array buffer
          // Int16Array.buffer is guaranteed to be even number of bytes (2 bytes per sample)
          try {
            // Verify it's even number of bytes before sending
            const byteLength = pcm16.buffer.byteLength;
            if (byteLength % 2 !== 0) {
              console.warn('Audio buffer has odd number of bytes, skipping:', byteLength);
              return;
            }
            // Send the ArrayBuffer directly (it's already the correct format)
            wsRef.current.send(pcm16.buffer);
          } catch (error) {
            console.error('Error sending audio:', error);
          }
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

