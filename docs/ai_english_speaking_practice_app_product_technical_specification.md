# AI English Speaking Practice App (Like Talking to a Friend)

## 1. Product Overview

**Goal:**
Build a simple but powerful web app using **Next.js + React** where users can practice **English speaking** by having **real-time voice conversations with an AI** that feels like a friend.

The AI:
- Talks naturally (voice-to-voice)
- Maintains **long-term memory** (remembers past conversations)
- Asks follow-up questions next time
- Allows topic-based or random conversations
- Helps users gain confidence over time

This document is written so it can be directly given to **Cursor / AI coding assistant**.

---

## 2. Core User Experience (UX Flow)

### First-time User Flow
1. User opens the platform
2. Signs up / logs in
3. Optional onboarding:
   - Upload a document (PDF/TXT) about themselves OR
   - Write a short intro prompt ("I am Hamza, software engineer, want to improve speaking") OR
   - Skip
4. Dashboard opens
5. User clicks **"Start Speaking"**
6. Selects:
   - Duration (5 / 10 / 15 minutes)
   - Topic (Custom / Random / Daily topic)
7. AI calls the user (voice conversation)
8. Session ends → summary saved

### Returning User Flow
1. User logs in
2. Dashboard shows:
   - Last conversation summary
   - AI greeting like: "Yesterday we talked about your job…"
3. User starts a new call

---

## 3. Feature Modules (High-Level)

1. Authentication Module
2. User Profile & Context Module
3. Conversation Engine (Voice)
4. AI Memory & Context Management
5. Session Management
6. Topic Engine
7. Post-Call Feedback & Summary
8. Admin / Debug (Optional)

---

## 4. Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **React Query (TanStack Query)** for server state
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components

### Backend
- **Node.js**
- **Express.js** (separate backend service)

### Database
- **PostgreSQL**
- **Prisma ORM**

### AI & Voice
- Speech-to-Text (STT)
- Large Language Model (LLM)
- Text-to-Speech (TTS)
- WebRTC / WebSocket for real-time audio

### Vector Memory
- pgvector (PostgreSQL extension)

---

## 5. Authentication Module

### Purpose
Identify users and attach conversation history to them.

### Features
- Email + password OR OAuth
- JWT / session-based auth

### Database Schema (Basic)
```
User
- id
- name
- email
- createdAt
```

---

## 6. User Profile & Context Module

### Purpose
Store **who the user is** so AI can speak naturally.

### User Context Inputs (Optional)
- Short bio (text)
- Goals ("Improve fluency", "Job interviews")
- Uploaded documents

### Storage Strategy
- Raw text → stored in DB
- Embeddings → stored in vector DB

### Example Context Prompt
```
User Info:
Name: Hamza
Profession: Software Engineer
Goal: Improve English speaking confidence
```

---

## 7. Conversation Engine (Voice System)

### Purpose
Enable real-time voice conversations.

### Flow
1. Mic access granted
2. User voice → Speech-to-Text
3. Text → LLM
4. LLM response → Text-to-Speech
5. Audio streamed back to user

### Communication
- WebRTC (preferred)
- WebSocket fallback

---

## 8. Session Management Module

### Purpose
Control call duration and state.

### Session Data
```
Session
- id
- userId
- topic
- duration
- startedAt
- endedAt
- transcript
- summary
```

### Timer Logic
- Countdown timer on frontend
- Auto end call when time completes

---

## 9. Topic Engine

### Purpose
Guide conversation flow.

### Topic Types
1. User-selected topic
2. Random topic
3. Daily topic

### Example Topics
- Daily routine
- Job & career
- Travel experiences
- Opinions

### Prompt Injection
```
Conversation Topic: Travel Experiences
Ask open-ended questions.
```

---

## 10. AI Memory & Context Management (VERY IMPORTANT)

### Short-Term Memory
- Current session transcript
- Passed to LLM continuously

### Long-Term Memory
- After session ends:
  - Generate summary
  - Extract key facts
  - Store embeddings

### Next Session Usage
- Fetch relevant past memories
- Inject into system prompt

### Example Memory Prompt
```
Previous Context:
Yesterday, the user talked about their job as a frontend developer and struggled with pronunciation.
Ask follow-up questions naturally.
```

---

## 11. Prompt Architecture

### System Prompt
Defines AI personality
```
You are a friendly English-speaking partner.
Speak naturally.
Correct mistakes gently.
Ask follow-up questions.
```

### User Context Prompt
Injected from profile + memory

### Conversation Prompt
Live dialogue

---

## 12. Post-Call Feedback & Mistake Analysis Module

### Purpose
Help users **clearly understand their repeated English mistakes** in a friendly, non-judgmental way.

### When It Runs
- Automatically after each call ends

### Inputs
- Full session transcript
- Previous mistake history
- User proficiency level

### AI Responsibilities
1. Analyze grammar patterns
2. Detect repeated mistakes
3. Group mistakes by category
4. Explain mistakes in **simple English**

### Mistake Categories
- Tense confusion (past / present / future)
- Have / had / has misuse
- Prepositions (in, on, at)
- Sentence structure
- Pronunciation notes (if detectable)

### Output Format (Saved as Docs)

```
Session English Report

1. Repeated Mistakes
- You often mix **past and present tense**
  ❌ "Yesterday I go to office"
  ✅ "Yesterday I went to the office"

2. Have / Had Confusion
- You said "I have finished yesterday"
  Correct form: "I had finished yesterday"

3. Good Improvements
- Your sentence flow is getting better
- Vocabulary usage improved

4. Simple Tip for Next Session
- When you mention time like yesterday, always use past tense
```

### Storage
- Stored as structured JSON
- Rendered as a beautiful readable document in UI

---

## 13. Database Schema (Simplified)

```
User
Session
Message
Memory
Topic
```

---

## 14. API Structure

### Routes
```
POST /api/auth
POST /api/session/start
POST /api/session/end
POST /api/audio/stream
GET  /api/memory
```

---

## 15. Frontend Pages

```
/            → Landing
/login       → Auth
/dashboard   → User home
/speak       → Call screen
/history     → Past sessions
```

---

## 16. MVP Scope (IMPORTANT)

### Phase 1 (Must Have)
- Login
- Start text-based conversation
- Session timer
- Post-call mistake analysis document

### Phase 2
- Voice conversation
- Topic selection
- Memory-based follow-ups

### Phase 3
- Pronunciation feedback
- Difficulty levels
- Personality modes

---

## 17. Success Criteria

- User feels AI remembers them
- Conversation feels natural
- Low latency voice
- Simple UI

---

## 18. Notes for Cursor / AI Engineer

- Build module-by-module
- Start with text-only conversation
- Add voice after
- Memory system is critical
- Keep prompts clean and structured

---

**End of Specification**

