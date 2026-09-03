# Voice/Call Feature Setup

## ✅ Implementation Complete!

Voice conversation functionality has been added to the app. Users can now have voice-based conversations with the AI, just like a phone call!

## Features Implemented

### Backend
- ✅ **STT Service** (`sttService.ts`) - Speech-to-Text using OpenAI Whisper
- ✅ **TTS Service** (`ttsService.ts`) - Text-to-Speech using OpenAI TTS
- ✅ **Voice Service** (`voiceService.ts`) - Orchestrates STT → LLM → TTS flow
- ✅ **Voice Controller** (`voiceController.ts`) - Handles audio uploads
- ✅ **API Endpoint** - `POST /api/v1/conversation/voice`

### Frontend
- ✅ **Voice Chat Component** (`voice-chat.tsx`) - Full voice conversation UI
- ✅ **Audio Recording** - Browser MediaRecorder API
- ✅ **Audio Playback** - HTML5 Audio API
- ✅ **Mode Toggle** - Switch between Text and Voice modes

## How It Works

1. **User speaks** → Browser records audio (WebM format)
2. **Audio uploaded** → Backend receives audio file
3. **STT (Speech-to-Text)** → OpenAI Whisper converts audio to text
4. **LLM Processing** → Text sent to AI (same as text chat)
5. **TTS (Text-to-Speech)** → AI response converted to audio
6. **Audio returned** → Frontend plays audio response

## Requirements

### API Keys Needed

You need `OPENAI_API_KEY` in `backend/.env`:

```env
OPENAI_API_KEY="sk-your-key-here"
```

This key is used for:
- **Whisper API** (Speech-to-Text) - $0.006 per minute
- **TTS API** (Text-to-Speech) - $15 per 1M characters
- **Chat API** (LLM) - Already configured

### Browser Requirements

- **Microphone access** - User must grant permission
- **Modern browser** - Chrome, Firefox, Edge, Safari (latest)
- **HTTPS** - Required for microphone access (or localhost for development)

## Usage

1. **Start a session** as usual
2. **Switch to "Voice Call" tab** in the session page
3. **Click the microphone button** to start recording
4. **Speak your message**
5. **Click again to stop** recording
6. **Wait for processing** (STT → LLM → TTS)
7. **AI response plays automatically**

## API Endpoint

### POST `/api/v1/conversation/voice`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `audio`: Audio file (Blob/File)
  - `sessionId`: Session ID (string)

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": { ... },
    "assistantMessage": { ... },
    "audio": "base64-encoded-audio",
    "audioFormat": "mp3"
  }
}
```

## Cost Estimates

### Per Conversation Turn:
- **STT (Whisper)**: ~$0.001 per 10 seconds of speech
- **LLM**: Same as text chat (~$0.001-0.01 per message)
- **TTS**: ~$0.00015 per 100 words

### Example:
- 5-minute conversation (30 turns)
- ~$0.15-0.30 total cost

## Troubleshooting

### Microphone Not Working
- Check browser permissions
- Ensure HTTPS (or localhost)
- Try different browser

### Audio Not Playing
- Check browser audio settings
- Verify audio format support
- Check console for errors

### STT/TTS Errors
- Verify `OPENAI_API_KEY` is set
- Check API key has access to Whisper and TTS
- Check API usage limits

### "No speech detected"
- Speak louder/clearer
- Check microphone is working
- Ensure audio file is not empty

## Future Enhancements

- [ ] Real-time streaming (WebSocket)
- [ ] Push-to-talk mode
- [ ] Voice activity detection (auto-stop)
- [ ] Multiple voice options
- [ ] Speed control
- [ ] Visual waveform display
- [ ] Conversation transcription display

## Testing

1. **Start backend**: `npm run dev:backend`
2. **Start frontend**: `npm run dev:frontend`
3. **Create a session**
4. **Switch to Voice Call tab**
5. **Test recording and playback**

---

**Note**: Voice features require OpenAI API key with access to Whisper and TTS APIs.

