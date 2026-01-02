# 📱 Mobile App Development Strategy

**Goal:** Build Android app (and eventually iOS) for AI English Speaking Practice platform  
**Key Question:** Do we need to rebuild backend/AI? **NO!** ✅

---

## 🎯 Strategy Overview

### ✅ What You Already Have (Reuse This!)

1. **Backend API** (Render)
   - REST endpoints for auth, sessions, conversations
   - WebSocket for real-time voice ("Call with AI")
   - Database with Prisma
   - All business logic

2. **AI Integration**
   - OpenAI Realtime API for voice calls
   - OpenAI Whisper for STT
   - OpenAI TTS for responses
   - All working and tested

3. **Authentication**
   - JWT tokens
   - User management
   - Session management

### 🚀 What You Need to Build

**Just the Mobile App!** The backend stays the same.

---

## 📱 Mobile App Architecture

```
┌─────────────────────────────────────┐
│      Android App (New)              │
│  - UI/UX                            │
│  - Audio Recording                  │
│  - WebSocket Client                 │
│  - API Client                       │
└──────────────┬──────────────────────┘
               │
               │ HTTP/REST + WebSocket
               │
┌──────────────▼──────────────────────┐
│   Existing Backend (Reuse!)         │
│  - All API endpoints                │
│  - WebSocket server                 │
│  - AI integrations                  │
│  - Database                         │
└─────────────────────────────────────┘
```

**Key Point:** Mobile app is just a client, like your web frontend!

---

## 🛠️ Technology Options for Android

### Option 1: React Native (Recommended) ⭐

**Why:**
- ✅ Write once, deploy to Android + iOS later
- ✅ Share code with web frontend (some components)
- ✅ Large community, lots of libraries
- ✅ Hot reload for fast development
- ✅ Can reuse some React knowledge

**Libraries Needed:**
- `react-native` - Core framework
- `@react-native-async-storage/async-storage` - Local storage
- `react-native-websocket` or `socket.io-client` - WebSocket
- `react-native-audio-recorder-player` - Audio recording
- `@react-native-community/audio-toolkit` - Audio playback
- `axios` or `fetch` - API calls

**Pros:**
- Cross-platform (Android + iOS)
- Fast development
- Good ecosystem

**Cons:**
- Slightly larger app size
- Some native features need extra setup

---

### Option 2: Flutter

**Why:**
- ✅ Cross-platform (Android + iOS)
- ✅ Great performance
- ✅ Beautiful UI out of the box
- ✅ Growing ecosystem

**Libraries Needed:**
- `http` - API calls
- `web_socket_channel` - WebSocket
- `record` - Audio recording
- `audioplayers` - Audio playback
- `shared_preferences` - Local storage

**Pros:**
- Excellent performance
- Great UI framework
- Single codebase for both platforms

**Cons:**
- Need to learn Dart language
- Different from your current stack

---

### Option 3: Native Android (Kotlin/Java)

**Why:**
- ✅ Best performance
- ✅ Full access to Android features
- ✅ Native look and feel

**Libraries Needed:**
- `Retrofit` or `OkHttp` - API calls
- `OkHttp WebSocket` - WebSocket
- `MediaRecorder` - Audio recording
- `MediaPlayer` - Audio playback
- `SharedPreferences` - Local storage

**Pros:**
- Best performance
- Full Android features
- No cross-platform compromises

**Cons:**
- Need to build iOS separately later
- More code to maintain
- Need to learn Android development

---

## 🎯 Recommended Approach: React Native

**Why React Native for your case:**
1. You already know React (from Next.js frontend)
2. Can reuse some logic/patterns
3. Faster to market (Android + iOS later)
4. Good WebSocket support
5. Great audio libraries available

---

## 📋 Implementation Plan

### Phase 1: Setup & Core Features (Week 1-2)

1. **Project Setup**
   ```bash
   npx react-native init SpeakEaseApp
   cd SpeakEaseApp
   ```

2. **API Client Setup**
   - Create API service (similar to your web frontend)
   - Handle authentication (JWT tokens)
   - Store tokens securely

3. **Authentication Flow**
   - Login screen
   - Register screen
   - Token storage
   - Auto-login on app open

4. **Basic Navigation**
   - Bottom tabs or drawer
   - Home, Sessions, Profile screens

### Phase 2: Core Features (Week 3-4)

1. **Session Management**
   - List user sessions
   - Create new session
   - View session history
   - Uses existing `/api/v1/sessions` endpoints

2. **Text Chat**
   - Chat interface
   - Send/receive messages
   - Uses existing `/api/v1/conversation/text` endpoint

3. **Voice Chat (Standard)**
   - Record audio
   - Send to backend
   - Play AI response
   - Uses existing `/api/v1/conversation/voice` endpoint

### Phase 3: Real-time Voice (Week 5-6)

1. **WebSocket Integration**
   - Connect to your existing WebSocket server
   - Handle connection states
   - Reuse your backend WebSocket code!

2. **"Call with AI" Feature**
   - Real-time audio streaming
   - WebSocket for bidirectional audio
   - Uses your existing `/api/v1/conversation/realtime/ws` endpoint

3. **Audio Processing**
   - Record audio in correct format (24kHz, mono)
   - Convert to format backend expects
   - Play incoming audio responses

### Phase 4: Polish & Launch (Week 7-8)

1. **UI/UX Polish**
   - Match web app design
   - Smooth animations
   - Error handling

2. **Testing**
   - Test on different Android devices
   - Test network conditions
   - Test audio quality

3. **Launch Prep**
   - App icon, splash screen
   - Google Play Store setup
   - Privacy policy, terms

---

## 🔌 Backend API Endpoints (Already Exist!)

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Sessions
- `GET /api/v1/sessions` - List user sessions
- `POST /api/v1/sessions` - Create session
- `GET /api/v1/sessions/:id` - Get session details

### Conversations
- `POST /api/v1/conversation/text` - Send text message
- `POST /api/v1/conversation/voice` - Send voice message (multipart)
- `GET /api/v1/conversation/:sessionId/messages` - Get messages

### Real-time (WebSocket)
- `WS /api/v1/conversation/realtime/ws` - Real-time voice call
- `POST /api/v1/conversation/realtime/init` - Initialize real-time session

**All of these already work!** Just call them from your mobile app.

---

## 🎤 Audio Requirements for Mobile

### Recording Audio
- **Format:** PCM16, 24kHz, mono (same as web)
- **Library:** `react-native-audio-recorder-player`
- **Stream:** Send chunks in real-time via WebSocket

### Playing Audio
- **Format:** Receive PCM16 from backend
- **Convert:** To playable format (similar to web)
- **Library:** `react-native-audio-recorder-player` or `expo-av`

### WebSocket Audio Flow
```
Mobile App                    Backend                    OpenAI
    │                            │                          │
    ├─ Record Audio ────────────>│                          │
    │                            ├─ Convert ───────────────>│
    │                            │                          │
    │                            │<─ Audio Response ────────┤
    │<─ Audio Response ──────────┤                          │
    │                            │                          │
    └─ Play Audio                │                          │
```

---

## 📦 Project Structure (React Native)

```
SpeakEaseApp/
├── src/
│   ├── api/
│   │   ├── client.ts          # API client (axios/fetch)
│   │   ├── auth.ts            # Auth endpoints
│   │   ├── sessions.ts        # Session endpoints
│   │   └── conversation.ts    # Conversation endpoints
│   ├── websocket/
│   │   └── realtimeClient.ts  # WebSocket client
│   ├── audio/
│   │   ├── recorder.ts        # Audio recording
│   │   └── player.ts          # Audio playback
│   ├── screens/
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── Sessions/
│   │   ├── Chat/
│   │   └── Call/
│   ├── components/
│   │   ├── ChatMessage.tsx
│   │   ├── VoiceButton.tsx
│   │   └── CallInterface.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   └── store/
│       └── authStore.ts       # State management
├── android/                   # Android native code
└── package.json
```

---

## 🔐 Authentication Flow

```typescript
// 1. Login
const response = await api.post('/auth/login', { email, password });
const { accessToken, refreshToken } = response.data;

// 2. Store tokens securely
await AsyncStorage.setItem('accessToken', accessToken);
await AsyncStorage.setItem('refreshToken', refreshToken);

// 3. Use token in API calls
api.defaults.headers.Authorization = `Bearer ${accessToken}`;

// 4. Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
  }
);
```

---

## 🎤 Voice Chat Implementation

### Standard Voice Chat (REST API)

```typescript
// Record audio
const audioUri = await AudioRecorder.startRecording();

// Stop and get file
const result = await AudioRecorder.stopRecording();
const audioFile = result.uri;

// Send to backend
const formData = new FormData();
formData.append('audio', {
  uri: audioFile,
  type: 'audio/webm',
  name: 'audio.webm',
});
formData.append('sessionId', sessionId);

const response = await api.post('/conversation/voice', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Play AI response
const audioUrl = `data:audio/mp3;base64,${response.data.audio}`;
await AudioPlayer.play(audioUrl);
```

### Real-time Voice (WebSocket)

```typescript
// Connect to WebSocket
const ws = new WebSocket('wss://your-backend.onrender.com/api/v1/conversation/realtime/ws', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// Send audio chunks
const audioChunk = await recordAudioChunk(); // PCM16 format
ws.send(audioChunk);

// Receive audio responses
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'response.audio.delta') {
    playAudioChunk(message.delta); // base64 audio
  }
};
```

---

## 🚀 Quick Start Guide

### Step 1: Setup React Native Project

```bash
# Install React Native CLI
npm install -g react-native-cli

# Create project
npx react-native init SpeakEaseApp --template react-native-template-typescript

cd SpeakEaseApp

# Install dependencies
npm install axios @react-native-async-storage/async-storage
npm install react-native-audio-recorder-player
npm install react-native-websocket

# For Android
cd android && ./gradlew clean && cd ..
```

### Step 2: Create API Client

```typescript
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://speakease-backend-vxpz.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Step 3: Test Connection

```typescript
// Test if backend is accessible
const testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('Backend connected!', response.data);
  } catch (error) {
    console.error('Backend connection failed:', error);
  }
};
```

---

## 📊 Comparison: Web vs Mobile

| Feature | Web (Next.js) | Mobile (React Native) |
|---------|--------------|----------------------|
| **Backend** | ✅ Same API | ✅ Same API |
| **Auth** | ✅ JWT tokens | ✅ JWT tokens |
| **Text Chat** | ✅ REST API | ✅ REST API |
| **Voice Chat** | ✅ REST API | ✅ REST API |
| **Call with AI** | ✅ WebSocket | ✅ WebSocket |
| **Audio Recording** | MediaRecorder API | react-native-audio-recorder-player |
| **Audio Playback** | Web Audio API | react-native-audio-recorder-player |
| **State Management** | Zustand | Zustand (same!) |

**Key Point:** Same backend, different client!

---

## 💰 Cost Considerations

### What You Already Pay For:
- ✅ Backend hosting (Render - free tier)
- ✅ Database (Render - free tier)
- ✅ OpenAI API (pay per use)

### What You'll Need:
- ✅ Google Play Developer Account: **$25 one-time**
- ✅ App signing certificates: **Free**
- ✅ CI/CD for mobile: **Free** (GitHub Actions)

**Total Additional Cost: ~$25 one-time**

---

## 🎯 Recommended Tech Stack

```
Frontend (Mobile):
├── React Native (TypeScript)
├── React Navigation (routing)
├── Zustand (state management - same as web!)
├── Axios (API calls)
├── AsyncStorage (local storage)
├── react-native-audio-recorder-player (audio)
└── react-native-websocket (WebSocket)

Backend:
└── ✅ Keep existing backend (no changes needed!)
```

---

## 📝 Next Steps

1. **Decide on Framework**
   - React Native (recommended)
   - Flutter
   - Native Android

2. **Setup Development Environment**
   - Android Studio
   - React Native CLI
   - Test on emulator/device

3. **Start with MVP**
   - Authentication
   - Session list
   - Text chat
   - Then add voice features

4. **Reuse Backend**
   - No backend changes needed!
   - Just call existing APIs
   - WebSocket already works

---

## ✅ Summary

**Do you need to rebuild backend/AI?**  
**NO!** Your existing backend works perfectly for mobile.

**What you need to build:**
- Just the Android app (React Native recommended)
- API client to call your existing endpoints
- WebSocket client for real-time features
- Audio recording/playback (mobile-specific)

**Timeline:**
- MVP: 4-6 weeks
- Full features: 8-10 weeks
- Launch ready: 10-12 weeks

**Cost:**
- Development: Your time
- Launch: $25 (Google Play account)
- Backend: Already covered

---

**Ready to start? Let's build the Android app! 🚀**

