# Voice/Call Implementation Plan

## Current State
- ✅ Text-based chat (MVP)
- ❌ Voice/call functionality (Phase 2)

## What's Needed for Voice

### 1. Frontend Components
- Audio recording (microphone access)
- Audio playback (speaker output)
- Real-time audio streaming
- Push-to-talk or continuous recording
- Audio visualization

### 2. Backend Services
- WebSocket server for real-time audio streaming
- Speech-to-Text (STT) service integration
- Text-to-Speech (TTS) service integration
- Audio processing pipeline

### 3. Technology Stack
- **WebRTC** or **WebSocket** for real-time communication
- **OpenAI Whisper** or **Google Speech-to-Text** for STT
- **OpenAI TTS** or **ElevenLabs** for TTS
- **MediaRecorder API** (browser) for audio capture

## Implementation Approach

### Option A: WebSocket + Chunked Audio (Recommended)
1. User speaks → Browser records audio chunks
2. Send audio chunks via WebSocket to backend
3. Backend processes chunks with STT
4. Backend sends text to LLM
5. Backend converts LLM response to audio with TTS
6. Backend streams audio chunks back via WebSocket
7. Frontend plays audio chunks

### Option B: Full Audio Upload
1. User records full message
2. Upload audio file to backend
3. Backend: STT → LLM → TTS
4. Return audio file
5. Frontend plays audio

### Option C: Real-time Streaming (Advanced)
- Use WebRTC for peer-to-peer audio
- More complex but lower latency

## Required API Keys

- **STT**: OpenAI Whisper API (same key as LLM) or Google Speech-to-Text
- **TTS**: OpenAI TTS API or ElevenLabs

## Estimated Implementation Time

- Basic voice (Option B): 2-3 hours
- Real-time streaming (Option A): 4-6 hours
- WebRTC (Option C): 8-10 hours

