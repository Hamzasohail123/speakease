# Low-Latency Voice Architecture - Quick Summary

## 🎯 Goal
Achieve **≤1 second** response time from when user stops speaking to when AI starts responding.

## 🏗️ Architecture Decisions

### ✅ Confirmed Choices
1. **STT**: OpenAI Whisper (generic provider pattern for future models)
2. **TTS**: OpenAI TTS (generic provider pattern for future models)
3. **WebSocket**: `ws` library with Express.js
4. **VAD**: Client-side using `@ricky0123/vad-web` (300-500ms silence detection)
5. **User Toggle**: Users can switch between Standard and Low-Latency modes
6. **Latency Monitoring**: Timing logs/metrics at each stage

### 📊 Latency Budget

| Stage | Target | Max |
|-------|--------|-----|
| Silence Detection | 300-500ms | 500ms |
| STT Processing | 200-300ms | 500ms |
| LLM First Token | 200-300ms | 500ms |
| TTS First Chunk | 100-200ms | 300ms |
| **Total** | **800-1200ms** | **1800ms** |

## 🔄 Streaming Pipeline

```
User Mic → WebSocket → STT (buffered) → VAD (silence) → LLM (tokens) → TTS (chunks) → Audio Player
```

**Everything runs in parallel, not sequentially!**

## 📁 Key Files to Create

### Backend
- `backend/src/modules/conversation/streaming/providers/` - Provider interfaces & implementations
- `backend/src/modules/conversation/streaming/services/` - Streaming services
- `backend/src/modules/conversation/streaming/websocket/` - WebSocket server & handlers

### Frontend
- `frontend/src/components/conversation/streaming-voice-chat.tsx` - New streaming component
- `frontend/src/components/conversation/voice-mode-toggle.tsx` - Toggle between modes
- `frontend/src/hooks/useWebSocket.ts` - WebSocket connection hook
- `frontend/src/hooks/useVAD.ts` - Voice Activity Detection hook

## ⏱️ Implementation Timeline

**Total: 30-40 hours**

1. **Phase 1**: Infrastructure & Providers (4-5h)
2. **Phase 2**: VAD & Audio Chunking (3-4h)
3. **Phase 3**: Streaming STT (3-4h)
4. **Phase 4**: Early LLM Trigger (2-3h)
5. **Phase 5**: Streaming TTS (3-4h)
6. **Phase 6**: Integration (4-5h)
7. **Phase 7**: User Toggle (2h)
8. **Phase 8**: Latency Monitoring (3-4h)
9. **Phase 9**: Error Handling (2-3h)
10. **Phase 10**: Testing (4-5h)

## 🔑 Key Features

### Provider Pattern
- Generic interfaces for STT/TTS
- Easy to add new providers (Deepgram, ElevenLabs, etc.)
- User payment plan-based selection

### User Toggle
- Standard Mode: Current implementation (full audio upload)
- Low-Latency Mode: New streaming implementation
- Users can switch anytime

### Latency Tracking
- Log timing at each stage
- Monitor end-to-end latency
- Optimize based on real measurements

## 📖 Full Documentation

See `LOW_LATENCY_VOICE_ARCHITECTURE.md` for complete technical specification.

