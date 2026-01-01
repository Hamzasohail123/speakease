# Low-Latency Streaming Voice Architecture

## Overview

This document outlines the technical specification for implementing a low-latency streaming voice conversation system that achieves **≤1 second response time** from when the user stops speaking to when the AI starts responding.

## Performance Target

- **Goal**: AI starts replying within **≤1 second** after user stops speaking
- **Target Latency Budget**: ~800-1200ms total
- **User Experience**: Conversation should feel like a real phone call

---

## Architecture Principles

### 1. Generic & Extensible Design

All services (STT, TTS, LLM) must be implemented with a **provider pattern** to support:
- Multiple service providers (OpenAI, Deepgram, ElevenLabs, etc.)
- User payment plan-based provider selection
- Easy addition of new providers in the future
- Fallback mechanisms

### 2. Full Streaming Pipeline

Everything runs **in parallel**, not sequentially:
```
User Mic Audio (chunks)
 → WebSocket
 → Streaming STT (partial results)
 → Voice Activity Detection (300-500ms silence)
 → LLM (token streaming)
 → Streaming TTS
 → Audio chunks back to user
```

### 3. User Toggle Option

Users can switch between:
- **Standard Voice Mode**: Current implementation (full audio upload)
- **Low-Latency Voice Mode**: New streaming implementation

---

## Technology Stack

### Backend
- **WebSocket**: `ws` library with Express.js
- **STT Provider**: OpenAI Whisper (extensible to Deepgram, AssemblyAI)
- **TTS Provider**: OpenAI TTS (extensible to ElevenLabs, Google TTS)
- **LLM Provider**: OpenAI (already implemented, supports streaming)
- **VAD**: Client-side using `@ricky0123/vad-web` (recommended)

### Frontend
- **WebSocket Client**: Native WebSocket API
- **Audio Recording**: MediaRecorder API (chunked)
- **Audio Playback**: Web Audio API or HTML5 Audio (chunked playback)
- **VAD Library**: `@ricky0123/vad-web` for client-side silence detection

---

## Service Provider Architecture

### Provider Interface Pattern

All services (STT, TTS) will implement a common interface:

```typescript
// Generic Provider Interface
interface STTProvider {
  transcribe(audioChunk: Buffer, options?: STTOptions): Promise<STTResult>;
  transcribeStream?(audioChunk: Buffer, options?: STTOptions): AsyncGenerator<STTResult>;
  supportsStreaming(): boolean;
}

interface TTSProvider {
  synthesize(text: string, options?: TTSOptions): Promise<Buffer>;
  synthesizeStream?(text: string, options?: TTSOptions): AsyncGenerator<Buffer>;
  supportsStreaming(): boolean;
}
```

### Provider Selection Strategy

```typescript
// User-based provider selection
interface UserVoiceConfig {
  userId: string;
  sttProvider: 'openai' | 'deepgram' | 'assemblyai';
  ttsProvider: 'openai' | 'elevenlabs' | 'google';
  plan: 'free' | 'premium' | 'enterprise';
}
```

**Provider Selection Rules**:
- **Free Plan**: OpenAI Whisper + OpenAI TTS
- **Premium Plan**: Deepgram (streaming STT) + ElevenLabs (streaming TTS)
- **Enterprise Plan**: Custom provider selection

---

## Voice Activity Detection (VAD) Strategy

### Recommended: Client-Side VAD

**Why Client-Side VAD?**
- Faster detection (no network latency)
- Reduces server load
- Better user experience (instant feedback)

**Implementation**:
- Use `@ricky0123/vad-web` library
- Detect silence threshold: **300-500ms**
- Send "user stopped speaking" event via WebSocket
- Server triggers LLM immediately upon receiving event

**Alternative: Server-Side VAD**
- Analyze audio chunk amplitude/energy
- More accurate but adds latency
- Use as fallback if client-side fails

### VAD Configuration

```typescript
interface VADConfig {
  threshold: number; // 0.0 to 1.0 (default: 0.5)
  silenceDuration: number; // milliseconds (default: 400)
  minSpeechDuration: number; // milliseconds (default: 100)
}
```

---

## WebSocket Architecture

### Connection Setup

**Endpoint**: `ws://localhost:3001/api/v1/conversation/stream`

**Authentication**:
- JWT token passed in connection query: `?token=xxx`
- Validate token on connection
- Store connection with userId/sessionId mapping

### Message Protocol

```typescript
// Client → Server Messages
interface ClientMessage {
  type: 'audio_chunk' | 'silence_detected' | 'end_session' | 'ping';
  sessionId: string;
  data?: {
    audio?: ArrayBuffer; // Base64 encoded
    timestamp?: number;
  };
}

// Server → Client Messages
interface ServerMessage {
  type: 'stt_partial' | 'stt_final' | 'llm_token' | 'tts_chunk' | 'error' | 'pong';
  sessionId: string;
  data?: {
    text?: string;
    audio?: ArrayBuffer; // Base64 encoded
    timestamp?: number;
    latency?: {
      stt?: number;
      llm?: number;
      tts?: number;
      total?: number;
    };
  };
}
```

### Connection Management

```typescript
interface ConnectionManager {
  connections: Map<string, WebSocket>; // userId -> WebSocket
  sessions: Map<string, string>; // sessionId -> userId
  
  addConnection(userId: string, sessionId: string, ws: WebSocket): void;
  removeConnection(userId: string): void;
  sendToUser(userId: string, message: ServerMessage): void;
  broadcastToSession(sessionId: string, message: ServerMessage): void;
}
```

---

## Streaming Pipeline Implementation

### Stage 1: Audio Capture & Transmission

**Frontend**:
- Record audio in chunks (100-200ms intervals)
- Send chunks immediately via WebSocket
- Don't wait for full sentence

**Backend**:
- Receive audio chunks
- Buffer chunks until silence detected
- Trigger STT when silence detected

### Stage 2: Streaming STT

**OpenAI Whisper (Current)**:
- Doesn't support true streaming
- **Simulated Streaming**: Buffer chunks, call API when silence detected
- Return full transcript (not partial)

**Future Providers (Deepgram/AssemblyAI)**:
- True streaming support
- Receive partial transcripts in real-time
- Send partial transcripts to frontend immediately

**Implementation**:
```typescript
class StreamingSTTService {
  private buffer: Buffer[] = [];
  private lastActivity: number = 0;
  
  async processChunk(chunk: Buffer, silenceDetected: boolean): Promise<STTResult | null> {
    this.buffer.push(chunk);
    this.lastActivity = Date.now();
    
    if (silenceDetected && this.buffer.length > 0) {
      const fullAudio = Buffer.concat(this.buffer);
      const result = await this.provider.transcribe(fullAudio);
      this.buffer = [];
      return result;
    }
    
    return null; // Still buffering
  }
}
```

### Stage 3: Early LLM Trigger

**Strategy**:
- Trigger LLM as soon as silence detected
- Don't wait for perfect grammar
- Use partial transcript if available

**Implementation**:
```typescript
class StreamingLLMService {
  async generateResponse(
    partialText: string,
    context: ConversationContext
  ): AsyncGenerator<string> {
    // Use OpenAI streaming API
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: buildMessages(partialText, context),
      stream: true, // Enable token streaming
    });
    
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) yield token;
    }
  }
}
```

### Stage 4: Streaming TTS

**OpenAI TTS (Current)**:
- Doesn't support true streaming
- **Simulated Streaming**: 
  - Split LLM response into sentences
  - Convert each sentence to audio
  - Send audio chunks as they're generated

**Future Providers (ElevenLabs)**:
- True streaming support
- Convert tokens to audio in real-time
- Lower latency

**Implementation**:
```typescript
class StreamingTTSService {
  async *synthesizeStream(text: string, options: TTSOptions): AsyncGenerator<Buffer> {
    // Split into sentences for chunked processing
    const sentences = this.splitIntoSentences(text);
    
    for (const sentence of sentences) {
      const audio = await this.provider.synthesize(sentence, options);
      yield audio;
    }
  }
}
```

---

## Latency Measurement & Monitoring

### Timing Metrics

Track latency at each stage:

```typescript
interface LatencyMetrics {
  audioCapture: number; // Time to capture audio chunk
  networkSend: number; // Time to send to server
  sttProcessing: number; // STT API call time
  vadDetection: number; // Silence detection time
  llmFirstToken: number; // Time to first LLM token
  llmFullResponse: number; // Time to complete LLM response
  ttsFirstChunk: number; // Time to first TTS audio chunk
  ttsFullAudio: number; // Time to complete TTS
  networkReceive: number; // Time to receive audio chunk
  audioPlayback: number; // Time to start playback
  
  totalLatency: number; // End-to-end latency
}
```

### Logging Strategy

```typescript
// Backend logging
logger.info('Latency Metrics', {
  sessionId,
  stage: 'stt',
  duration: sttLatency,
  timestamp: Date.now(),
});

// Frontend logging
console.log('Latency Metrics', {
  stage: 'audio_playback',
  duration: playbackLatency,
  timestamp: Date.now(),
});
```

### Target Latency Budget

| Stage | Target Time | Max Time |
|-------|------------|----------|
| Silence Detection | 300-500ms | 500ms |
| STT Processing | 200-300ms | 500ms |
| LLM First Token | 200-300ms | 500ms |
| TTS First Chunk | 100-200ms | 300ms |
| **Total** | **800-1200ms** | **1800ms** |

---

## File Structure

### Backend

```
backend/src/
├── modules/
│   └── conversation/
│       ├── streaming/
│       │   ├── providers/
│       │   │   ├── stt/
│       │   │   │   ├── base.ts (STTProvider interface)
│       │   │   │   ├── openaiSttProvider.ts
│       │   │   │   ├── deepgramSttProvider.ts (future)
│       │   │   │   └── index.ts
│       │   │   ├── tts/
│       │   │   │   ├── base.ts (TTSProvider interface)
│       │   │   │   ├── openaiTtsProvider.ts
│       │   │   │   ├── elevenlabsTtsProvider.ts (future)
│       │   │   │   └── index.ts
│       │   │   └── providerFactory.ts
│       │   ├── services/
│       │   │   ├── streamingSttService.ts
│       │   │   ├── streamingLlmService.ts
│       │   │   ├── streamingTtsService.ts
│       │   │   ├── vadService.ts
│       │   │   └── streamingVoiceService.ts (orchestrator)
│       │   ├── websocket/
│       │   │   ├── websocketServer.ts
│       │   │   ├── connectionManager.ts
│       │   │   ├── messageHandler.ts
│       │   │   └── middleware.ts (auth)
│       │   └── utils/
│       │       ├── latencyTracker.ts
│       │       └── audioBuffer.ts
│       ├── services/
│       │   ├── sttService.ts (existing, keep for standard mode)
│       │   ├── ttsService.ts (existing, keep for standard mode)
│       │   └── voiceService.ts (existing, keep for standard mode)
│       └── controllers/
│           ├── voiceController.ts (existing, keep for standard mode)
│           └── streamingVoiceController.ts (new)
```

### Frontend

```
frontend/src/
├── components/
│   └── conversation/
│       ├── voice-chat.tsx (existing, standard mode)
│       ├── streaming-voice-chat.tsx (new, low-latency mode)
│       └── voice-mode-toggle.tsx (new)
├── hooks/
│   ├── useWebSocket.ts (new)
│   ├── useVAD.ts (new)
│   └── useStreamingAudio.ts (new)
├── lib/
│   ├── websocket/
│   │   ├── client.ts
│   │   └── messageTypes.ts
│   └── audio/
│       ├── chunkRecorder.ts
│       └── chunkPlayer.ts
└── stores/
    └── voiceConfigStore.ts (new, user voice preferences)
```

---

## Implementation Phases

### Phase 1: Infrastructure & Provider Architecture (4-5 hours)
- [ ] Create provider interfaces (STT, TTS)
- [ ] Implement OpenAI providers
- [ ] Create provider factory
- [ ] Setup WebSocket server with Express
- [ ] Implement connection manager
- [ ] Add authentication middleware

### Phase 2: Client-Side VAD & Audio Chunking (3-4 hours)
- [ ] Install and configure `@ricky0123/vad-web`
- [ ] Implement audio chunk recorder
- [ ] Implement silence detection
- [ ] Create WebSocket client hook
- [ ] Send audio chunks and VAD events

### Phase 3: Streaming STT Service (3-4 hours)
- [ ] Create streaming STT service
- [ ] Implement audio buffering
- [ ] Integrate with provider system
- [ ] Handle partial transcripts (for future providers)
- [ ] Send STT results via WebSocket

### Phase 4: Early LLM Trigger (2-3 hours)
- [ ] Modify conversation service for streaming
- [ ] Implement token-by-token streaming
- [ ] Trigger LLM on silence detection
- [ ] Send LLM tokens via WebSocket

### Phase 5: Streaming TTS Service (3-4 hours)
- [ ] Create streaming TTS service
- [ ] Implement sentence splitting
- [ ] Integrate with provider system
- [ ] Convert text chunks to audio
- [ ] Send audio chunks via WebSocket

### Phase 6: Integration & Orchestration (4-5 hours)
- [ ] Create streaming voice orchestrator
- [ ] Connect all services in pipeline
- [ ] Handle parallel processing
- [ ] Create frontend streaming voice component
- [ ] Implement audio chunk player
- [ ] Add real-time UI updates

### Phase 7: User Toggle & Mode Selection (2 hours)
- [ ] Create voice mode toggle component
- [ ] Store user preference
- [ ] Route to appropriate voice component
- [ ] Handle mode switching mid-session

### Phase 8: Latency Monitoring & Optimization (3-4 hours)
- [ ] Implement latency tracker
- [ ] Add timing logs at each stage
- [ ] Create metrics dashboard (optional)
- [ ] Optimize buffer sizes
- [ ] Tune VAD thresholds

### Phase 9: Error Handling & Fallback (2-3 hours)
- [ ] Implement fallback to standard voice
- [ ] Handle WebSocket disconnections
- [ ] Handle provider failures
- [ ] Add retry logic
- [ ] Graceful error messages

### Phase 10: Testing & Validation (4-5 hours)
- [ ] Unit tests for providers
- [ ] Integration tests for pipeline
- [ ] Latency measurement tests
- [ ] Load testing
- [ ] User acceptance testing

**Total Estimated Time: 30-40 hours**

---

## Configuration

### Environment Variables

```env
# WebSocket
WS_PORT=3001
WS_PATH=/api/v1/conversation/stream

# STT Provider (default)
DEFAULT_STT_PROVIDER=openai
OPENAI_API_KEY=sk-xxx

# TTS Provider (default)
DEFAULT_TTS_PROVIDER=openai

# Future providers
DEEPGRAM_API_KEY=xxx
ELEVENLABS_API_KEY=xxx

# VAD Configuration
VAD_SILENCE_THRESHOLD=400
VAD_MIN_SPEECH_DURATION=100
```

### User Voice Configuration (Database)

```typescript
// Add to UserProfile or new table
interface UserVoiceSettings {
  userId: string;
  preferredMode: 'standard' | 'low-latency';
  sttProvider: 'openai' | 'deepgram' | 'assemblyai';
  ttsProvider: 'openai' | 'elevenlabs' | 'google';
  vadSensitivity: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Migration Strategy

### Backward Compatibility
- Keep existing `voiceService.ts` and `voiceController.ts`
- Add new streaming services alongside
- Users can toggle between modes
- No breaking changes to existing API

### Gradual Rollout
1. **Phase 1**: Deploy to staging, test with team
2. **Phase 2**: Beta release to premium users
3. **Phase 3**: Full release with toggle option
4. **Phase 4**: Make low-latency default for premium users

---

## Future Enhancements

### Additional Providers
- **Deepgram**: True streaming STT
- **AssemblyAI**: Real-time transcription
- **ElevenLabs**: High-quality streaming TTS
- **Google Cloud TTS**: Alternative TTS option

### Advanced Features
- **Adaptive Latency**: Adjust based on network conditions
- **Quality Modes**: Trade-off between latency and quality
- **Offline Mode**: Client-side processing for ultra-low latency
- **Multi-language Support**: VAD and STT for multiple languages

---

## Success Criteria

1. **Latency**: ≤1 second from silence to first audio
2. **Reliability**: 99%+ success rate for streaming connections
3. **User Experience**: Smooth, natural conversation flow
4. **Extensibility**: Easy to add new providers
5. **Backward Compatibility**: Existing voice mode still works

---

## Notes for Implementation

- **Start Simple**: Begin with OpenAI providers (simulated streaming)
- **Measure Everything**: Log latency at each stage
- **Test Early**: Test with real users as soon as possible
- **Iterate**: Optimize based on actual latency measurements
- **Document**: Keep this document updated as implementation progresses

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-01  
**Status**: Ready for Implementation Review

