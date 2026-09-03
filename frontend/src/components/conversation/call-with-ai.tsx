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
  const nextAudioTimeRef = useRef<number>(0); // Track when next audio chunk should play
  const activeAudioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set()); // Track active audio sources to prevent overlap
  const sessionReadyRef = useRef<boolean>(false); // Track if OpenAI session is ready
  const vadStateRef = useRef<'silence' | 'speaking' | 'listening'>('silence'); // Client-side VAD state
  const vadSilenceStartRef = useRef<number>(0); // When silence started
  const vadNoiseFloorRef = useRef<number>(0.01); // Noise floor threshold (1% of max amplitude)
  const vadSpeechThresholdRef = useRef<number>(0.05); // Speech threshold (5% of max amplitude)
  const vadSilenceDurationRef = useRef<number>(500); // Silence duration in ms before considering speech ended
  const { toast } = useToast();

  // Initialize ring tone (AudioContext created lazily with correct sample rate)
  useEffect(() => {
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

  const ensureAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
  };

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
    ensureAudioContext();
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
      ensureAudioContext();
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

      ws.onmessage = async (event) => {
        // Handle messages from OpenAI Realtime API
        try {
          // OpenAI Realtime API sends both JSON and binary (audio) messages
          if (typeof event.data === 'string') {
            // JSON message
            const data = JSON.parse(event.data);
            
            // Log important message types for debugging
            if (data.type === 'response.audio.delta') {
              const deltaSize = data.delta ? data.delta.length : 0;
              console.log(`[FRONTEND] 🔊 Received audio delta: ${deltaSize} bytes (base64)`);
            } else if (['response.created', 'response.done', 'response.audio.done'].includes(data.type)) {
              console.log(`[FRONTEND] 📨 Received message: ${data.type}`);
            }
            
            handleRealtimeMessage(data);
          } else if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
            // FIXED: OpenAI Realtime API sends audio as JSON (base64 in response.audio.delta)
            // Binary messages are rare - log but don't process as audio
            const size = event.data instanceof ArrayBuffer 
              ? event.data.byteLength 
              : event.data.size;
            console.warn('[FRONTEND] Received unexpected binary data:', size, 'bytes');
            // Don't play binary data - audio comes in JSON messages as base64
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
          case 'response.audio.delta':
            // AI is speaking - audio chunk received as base64 in data.delta
            setIsAISpeaking(true);
            setIsUserSpeaking(false);
            // Play audio chunk if present
            if (data.delta && audioContextRef.current) {
              // CRITICAL: Pass base64 string directly - playAudioChunk will handle conversion
              // This avoids ArrayBuffer detachment issues
              // FIXED: Don't await - let it queue in background
              playAudioChunk(data.delta).catch((error) => {
                console.error('[FRONTEND] ❌ Error playing audio:', error);
              });
            } else {
              console.warn('[FRONTEND] ⚠️ response.audio.delta received but no delta data or AudioContext');
            }
            break;

          case 'response.audio_transcript.delta':
            // AI is generating transcript (text) - can log if needed
            break;

          case 'response.audio_transcript.done':
            // AI finished generating transcript
            if (data.response?.audio_transcript) {
              console.log('AI transcript:', data.response.audio_transcript);
            }
            break;

          case 'response.created':
            // AI started responding - reset audio queue for new response
            console.log('[FRONTEND] 🤖 AI started responding - resetting audio queue');
            setIsAISpeaking(true);
            setIsUserSpeaking(false);
            // FIXED: Reset audio queue when new response starts
            if (audioContextRef.current) {
              // Stop any currently playing audio sources
              activeAudioSourcesRef.current.forEach((source) => {
                try {
                  source.stop();
                } catch (e) {
                  // Source might already be stopped
                }
              });
              activeAudioSourcesRef.current.clear();
              // Reset queue time to current time
              nextAudioTimeRef.current = audioContextRef.current.currentTime;
            }
            break;

          case 'response.done':
            // AI finished responding
            console.log('[FRONTEND] 🤖 AI finished responding');
            setIsAISpeaking(false);
            break;

          case 'response.audio.done':
            // AI finished speaking - reset audio queue
            console.log('[FRONTEND] 🎵 AI finished speaking, resetting audio queue');
            if (audioContextRef.current) {
              // Don't reset time here - let remaining chunks finish
              // nextAudioTimeRef.current = audioContextRef.current.currentTime;
            }
            setIsAISpeaking(false);
            break;

          case 'input_audio_buffer.speech_started':
            // User started speaking - OpenAI detected speech
            setIsUserSpeaking(true);
            setIsAISpeaking(false);
            console.log('[FRONTEND] 👤 User started speaking (detected by OpenAI VAD)');
            break;

          case 'input_audio_buffer.speech_stopped':
            // User stopped speaking - AI will respond after 500ms silence (configured in backend)
            setIsUserSpeaking(false);
            console.log('[FRONTEND] 👤 User stopped speaking, waiting for AI response...');
            break;

          case 'conversation.item.input_audio_transcription.completed':
            // OpenAI transcribed what user said
            if (data.transcript) {
              console.log('[FRONTEND] 📝 OpenAI transcribed: "' + data.transcript + '"');
            }
            break;

          case 'input_audio_buffer.committed':
            // Audio buffer committed - user's speech was processed
            if (data.input_audio_buffer?.transcript) {
              console.log('[FRONTEND] ✅ User said: "' + data.input_audio_buffer.transcript + '"');
            }
            break;

          case 'session.created':
            console.log('Session created:', data);
            break;

          case 'session.updated':
            console.log('Session updated:', data);
            break;

          case 'connection.ready':
            // Backend proxy sent connection ready message - OpenAI session is ready
            console.log('[FRONTEND] ✅ Connection ready:', data.message);
            sessionReadyRef.current = true;
            // Start audio capture if not already started
            if (callState === 'in-call' && !mediaStreamRef.current) {
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
  // CRITICAL: Always create a copy of the input buffer to avoid detachment
  const pcm16ToWav = (pcm16Data: ArrayBuffer, sampleRate: number = 24000): ArrayBuffer => {
    // Create a copy of the input buffer to prevent detachment
    const inputCopy = pcm16Data.slice(0);
    const pcm16 = new Int16Array(inputCopy);
    const length = pcm16.length;
    
    // Create new buffer for WAV (don't reuse input)
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
    
    // Copy PCM data to WAV buffer
    const wavData = new Int16Array(buffer, 44);
    wavData.set(pcm16);
    
    return buffer;
  };

  // Play audio chunk from base64 or ArrayBuffer
  // CRITICAL: This function creates proper copies to avoid ArrayBuffer detachment
  const playAudioChunk = async (audioData: string | ArrayBuffer) => {
    if (!audioContextRef.current) {
      console.warn('[FRONTEND] AudioContext not available');
      return;
    }

    try {
      let pcm16Buffer: ArrayBuffer;

      if (typeof audioData === 'string') {
        // Base64 encoded PCM16 audio from response.audio.delta
        // Decode base64 to binary string
        const binaryString = atob(audioData);
        
        // Create a NEW ArrayBuffer and copy data (prevents detachment)
        const buffer = new ArrayBuffer(binaryString.length);
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        pcm16Buffer = buffer; // This is a fresh buffer, not detached
      } else {
        // ArrayBuffer input - create a copy to prevent detachment
        pcm16Buffer = audioData.slice(0);
      }

      // Convert PCM16 to WAV (pcm16ToWav will create another copy internally)
      const wavBuffer = pcm16ToWav(pcm16Buffer, 24000);
      
      // Decode WAV to AudioBuffer
      const audioBuffer = await audioContextRef.current.decodeAudioData(wavBuffer.slice(0));

      // Create and schedule audio source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      // FIXED: Schedule audio to play sequentially (queue chunks)
      const currentTime = audioContextRef.current.currentTime;
      const startTime = Math.max(currentTime, nextAudioTimeRef.current);
      
      // Track this source so we can stop it if needed
      activeAudioSourcesRef.current.add(source);
      
      // Remove from set when finished
      source.onended = () => {
        activeAudioSourcesRef.current.delete(source);
        console.log(`[FRONTEND] Audio chunk finished, ${activeAudioSourcesRef.current.size} sources remaining`);
      };
      
      // Log if there are multiple sources playing (indicates overlap issue)
      if (activeAudioSourcesRef.current.size > 1) {
        console.warn(`[FRONTEND] ⚠️ Multiple audio sources playing (${activeAudioSourcesRef.current.size}) - possible overlap!`);
      }
      
      source.start(startTime);
      
      // Update next play time for sequential playback (add small gap to prevent overlap)
      const gap = 0.01; // 10ms gap between chunks to prevent overlap
      nextAudioTimeRef.current = startTime + audioBuffer.duration + gap;
      
      console.log(`[FRONTEND] 🔊 Queued audio chunk: start=${startTime.toFixed(3)}s, duration=${audioBuffer.duration.toFixed(3)}s, next=${nextAudioTimeRef.current.toFixed(3)}s`);
      
      setIsAISpeaking(true);
    } catch (error) {
      console.error('[FRONTEND] ❌ Error playing audio chunk:', error);
      setIsAISpeaking(false);
    }
  };

  // Start audio capture
  const startAudioCapture = async () => {
    try {
      // FIXED: Enhanced noise suppression and filtering
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 24000, // OpenAI Realtime API uses 24kHz
          echoCancellation: true,
          noiseSuppression: true, // Aggressive noise suppression
          autoGainControl: true, // Improve audio quality
          // Note: Browser-specific constraints (goog*) are applied automatically by Chrome
          // Don't constrain sampleRate in getUserMedia - let browser use native rate
          // The AudioContext will resample to 24kHz
        } as MediaTrackConstraints
      });
      mediaStreamRef.current = stream;

      // Create audio context for processing
      ensureAudioContext();
      if (!audioContextRef.current) {
        throw new Error('AudioContext not available');
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(8192, 1, 1); // Larger buffer for better VAD
      
      processor.onaudioprocess = (e) => {
        if (!isMuted && wsRef.current?.readyState === WebSocket.OPEN && sessionReadyRef.current) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // FIXED: Let OpenAI's server-side VAD handle speech detection
          // Client-side VAD is only for UI feedback, not blocking audio
          // Calculate RMS for visual feedback only
          let sumSquares = 0;
          let maxAmplitude = 0;
          for (let i = 0; i < inputData.length; i++) {
            const abs = Math.abs(inputData[i]);
            sumSquares += inputData[i] * inputData[i];
            maxAmplitude = Math.max(maxAmplitude, abs);
          }
          const rms = Math.sqrt(sumSquares / inputData.length);
          const amplitude = maxAmplitude;
          
          // Update noise floor for UI feedback only
          if (amplitude < vadNoiseFloorRef.current * 2) {
            vadNoiseFloorRef.current = vadNoiseFloorRef.current * 0.99 + amplitude * 0.01;
          }
          
          // Client-side VAD for UI feedback (not blocking)
          const now = Date.now();
          const isSpeech = amplitude > vadSpeechThresholdRef.current * 0.3 || rms > vadSpeechThresholdRef.current * 0.2; // Lower threshold for UI
          
          if (isSpeech) {
            if (vadStateRef.current === 'silence') {
              console.log('[FRONTEND] 🎤 Speech detected (UI feedback)');
              vadStateRef.current = 'speaking';
            }
            vadSilenceStartRef.current = 0;
          } else {
            if (vadStateRef.current === 'speaking') {
              if (vadSilenceStartRef.current === 0) {
                vadSilenceStartRef.current = now;
                vadStateRef.current = 'listening';
              } else {
                const silenceDuration = now - vadSilenceStartRef.current;
                if (silenceDuration >= vadSilenceDurationRef.current) {
                  vadStateRef.current = 'silence';
                  vadSilenceStartRef.current = 0;
                }
              }
            } else {
              vadStateRef.current = 'silence';
            }
          }
          
          // CRITICAL: Always send audio to OpenAI - let server-side VAD handle filtering
          // OpenAI's VAD is much better at distinguishing speech from noise
          const GAIN = 2.5; // Moderate gain to boost speech without distortion
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const amplified = Math.max(-1, Math.min(1, inputData[i] * GAIN));
            pcm16[i] = Math.round(amplified * 32767);
          }
          
          // Send ALL audio to OpenAI - server-side VAD will filter
          try {
            wsRef.current.send(pcm16.buffer);
          } catch (error) {
            console.error('[FRONTEND] Error sending audio:', error);
          }
        }
      };

      source.connect(processor);
      // Keep the processor alive without playing mic audio to speakers (prevents echo/feedback)
      const silenceGain = audioContextRef.current.createGain();
      silenceGain.gain.value = 0;
      processor.connect(silenceGain);
      silenceGain.connect(audioContextRef.current.destination);
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
    
    // FIXED: Stop all active audio sources
    activeAudioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    activeAudioSourcesRef.current.clear();
    
    // Reset VAD state
    vadStateRef.current = 'silence';
    vadSilenceStartRef.current = 0;
    sessionReadyRef.current = false;

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
