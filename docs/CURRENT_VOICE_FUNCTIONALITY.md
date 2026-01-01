# Current Voice/Audio Functionality

## Overview

The current voice implementation uses a **full audio upload** approach where the user records a complete message, uploads it, and receives a complete audio response. This is a **sequential, blocking** process.

---

## Current Flow

```
1. User clicks microphone button
2. Browser records FULL audio message (MediaRecorder API)
3. User clicks stop → Audio blob created
4. Frontend uploads ENTIRE audio file to backend
5. Backend: STT (convert full audio to text) ⏱️ ~2-3 seconds
6. Backend: LLM (get text response) ⏱️ ~1-2 seconds
7. Backend: TTS (convert full response to audio) ⏱️ ~1-2 seconds
8. Backend returns complete audio file
9. Frontend plays complete audio response
```

**Total Latency: ~4-7 seconds** (from stop recording to hearing response)

---

## Backend Implementation

### 1. **STT Service** (`backend/src/modules/conversation/services/sttService.ts`)

**Functionality:**
- Converts audio buffer to text using OpenAI Whisper API
- Accepts full audio file (not streaming)
- Creates temporary file, uploads to OpenAI
- Returns complete transcript

**Key Functions:**
- `speechToText(audioBuffer: Buffer, filename: string): Promise<STTResult>`
- `speechToTextFromFile(filePath: string): Promise<STTResult>`

**Limitations:**
- ❌ No streaming support
- ❌ Must wait for complete audio file
- ❌ No partial transcripts
- ❌ Blocking operation

---

### 2. **TTS Service** (`backend/src/modules/conversation/services/ttsService.ts`)

**Functionality:**
- Converts text to audio using OpenAI TTS API
- Accepts complete text response
- Returns complete audio buffer (MP3 format)

**Key Functions:**
- `textToSpeech(text: string, options: TTSOptions): Promise<Buffer>`
- `getAvailableVoices(): string[]`

**Options:**
- Voice: `'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'` (default: 'nova')
- Speed: `0.25 to 4.0` (default: 1.0)
- Format: `'mp3' | 'opus' | 'aac' | 'flac'` (default: 'mp3')

**Limitations:**
- ❌ No streaming support
- ❌ Must wait for complete text
- ❌ No chunked audio generation
- ❌ Blocking operation

---

### 3. **Voice Service** (`backend/src/modules/conversation/services/voiceService.ts`)

**Functionality:**
- Orchestrates the full voice pipeline: STT → LLM → TTS
- Processes complete audio messages sequentially

**Key Function:**
- `processVoiceMessage(userId, sessionId, audioBuffer, audioFormat): Promise<VoiceMessageResult>`

**Process:**
1. Convert audio to text (STT) - **WAITS for completion**
2. Send text to LLM - **WAITS for completion**
3. Convert LLM response to audio (TTS) - **WAITS for completion**
4. Return complete result

**Limitations:**
- ❌ Sequential processing (each step waits for previous)
- ❌ No parallel processing
- ❌ No early triggers
- ❌ No streaming

---

### 4. **Voice Controller** (`backend/src/modules/conversation/controllers/voiceController.ts`)

**Functionality:**
- Handles HTTP POST request with audio file upload
- Uses Multer for file upload handling
- Validates authentication and session
- Returns audio as base64 encoded string

**Endpoint:**
- `POST /api/v1/conversation/voice`
- Requires: `audio` file (multipart/form-data)
- Requires: `sessionId` (in body or query)
- Requires: Authentication token

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": { ... },
    "assistantMessage": { ... },
    "audio": "base64-encoded-audio-string",
    "audioFormat": "mp3"
  }
}
```

**Limitations:**
- ❌ HTTP only (no WebSocket)
- ❌ Full file upload required
- ❌ No real-time communication

---

### 5. **Routes** (`backend/src/modules/conversation/routes.ts`)

**Voice Route:**
```typescript
router.post('/voice', voiceUpload, processVoice);
```

- Protected by authentication middleware
- Uses Multer middleware for file upload
- Max file size: 10MB

---

## Frontend Implementation

### 1. **Voice Chat Component** (`frontend/src/components/conversation/voice-chat.tsx`)

**Functionality:**
- Full voice conversation UI
- Audio recording using MediaRecorder API
- Audio playback using HTML5 Audio API
- Message display with voice bubbles

**Key Features:**
- ✅ Microphone button (start/stop recording)
- ✅ Recording state indicator
- ✅ Processing indicator
- ✅ Audio playback button for AI responses
- ✅ Message history display
- ✅ Auto-play AI audio responses
- ✅ User messages shown briefly
- ✅ AI messages shown with play button

**State Management:**
- `isRecording`: Whether user is currently recording
- `isProcessing`: Whether backend is processing
- `isPlaying`: Whether audio is currently playing
- `messages`: Array of voice messages
- `playingMessageId`: ID of message currently playing

**Recording Process:**
1. User clicks microphone
2. Request microphone permission
3. Start MediaRecorder with `audio/webm;codecs=opus`
4. Collect audio chunks
5. User clicks stop
6. Create Blob from chunks
7. Upload to backend
8. Wait for complete response
9. Play audio

**Limitations:**
- ❌ Records full message before sending
- ❌ No real-time audio streaming
- ❌ No voice activity detection
- ❌ No partial transcript display
- ❌ No streaming audio playback

---

### 2. **API Client** (`frontend/src/lib/api/conversation.ts`)

**Functionality:**
- Sends voice message via FormData
- Handles authentication
- Returns complete response

**Key Function:**
- `sendVoiceMessage(sessionId: string, audioBlob: Blob)`

**Process:**
1. Create FormData with audio blob
2. Add sessionId
3. POST to `/api/v1/conversation/voice`
4. Wait for complete response
5. Return data

**Limitations:**
- ❌ HTTP only (no WebSocket)
- ❌ Full file upload
- ❌ No streaming

---

## Current Architecture Diagram

```
┌─────────────┐
│   Frontend  │
│             │
│ 1. Record   │
│    Full     │
│    Audio    │
└──────┬──────┘
       │
       │ HTTP POST
       │ (FormData)
       ▼
┌─────────────┐
│   Backend   │
│             │
│ 2. STT      │ ⏱️ 2-3s
│    (Wait)   │
│             │
│ 3. LLM      │ ⏱️ 1-2s
│    (Wait)   │
│             │
│ 4. TTS      │ ⏱️ 1-2s
│    (Wait)   │
└──────┬──────┘
       │
       │ HTTP Response
       │ (Base64 Audio)
       ▼
┌─────────────┐
│   Frontend  │
│             │
│ 5. Play     │
│    Audio    │
└─────────────┘

Total: 4-7 seconds
```

---

## Current Limitations Summary

### Backend
- ❌ **No streaming STT**: Must wait for complete audio
- ❌ **No streaming TTS**: Must wait for complete text
- ❌ **Sequential processing**: Each step blocks the next
- ❌ **No WebSocket**: Only HTTP requests
- ❌ **No VAD**: No voice activity detection
- ❌ **No early triggers**: Can't start LLM before STT completes
- ❌ **No provider abstraction**: Hard-coded to OpenAI

### Frontend
- ❌ **Full recording**: Must record complete message
- ❌ **No real-time feedback**: No partial transcripts
- ❌ **No streaming playback**: Must wait for complete audio
- ❌ **No VAD**: No automatic silence detection
- ❌ **HTTP only**: No WebSocket connection
- ❌ **Blocking UI**: User must wait for complete response

---

## What Works Well

### ✅ Current Strengths
1. **Simple & Reliable**: Full upload approach is straightforward
2. **Complete Messages**: User can speak full thoughts
3. **Good Audio Quality**: OpenAI TTS produces high-quality audio
4. **Error Handling**: Proper error handling in place
5. **User Experience**: Clear UI with recording/playing states
6. **Message History**: Messages are saved and displayed

---

## Comparison: Current vs. Low-Latency

| Feature | Current (Standard) | Low-Latency (New) |
|---------|-------------------|-------------------|
| **Latency** | 4-7 seconds | ≤1 second |
| **STT** | Full audio upload | Streaming chunks |
| **TTS** | Complete text → audio | Streaming text → audio |
| **LLM** | Wait for full STT | Trigger on silence |
| **VAD** | None | Client-side (300-500ms) |
| **Communication** | HTTP | WebSocket |
| **Processing** | Sequential | Parallel |
| **User Experience** | Wait for complete | Real-time feedback |

---

## Files Summary

### Backend Files
1. `backend/src/modules/conversation/services/sttService.ts` - STT service
2. `backend/src/modules/conversation/services/ttsService.ts` - TTS service
3. `backend/src/modules/conversation/services/voiceService.ts` - Voice orchestrator
4. `backend/src/modules/conversation/controllers/voiceController.ts` - HTTP controller
5. `backend/src/modules/conversation/routes.ts` - Route definitions

### Frontend Files
1. `frontend/src/components/conversation/voice-chat.tsx` - Voice chat UI
2. `frontend/src/lib/api/conversation.ts` - API client

---

## Next Steps: Low-Latency Implementation

The new low-latency system will:
1. ✅ Keep existing implementation (for standard mode)
2. ✅ Add new streaming implementation (for low-latency mode)
3. ✅ Add user toggle to switch between modes
4. ✅ Implement WebSocket for real-time communication
5. ✅ Add VAD for automatic silence detection
6. ✅ Implement streaming STT/TTS
7. ✅ Add early LLM triggers
8. ✅ Implement parallel processing

**See `LOW_LATENCY_VOICE_ARCHITECTURE.md` for full specification.**

