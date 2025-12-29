# Module Breakdown & Development Plan

## Overview

This document outlines each module to be built, their dependencies, and the order of implementation.

## Module Dependencies

```
Module 1: Project Setup
  └─> No dependencies

Module 2: Database Setup
  └─> Depends on: Module 1

Module 3: Authentication
  └─> Depends on: Module 2

Module 4: User Profile & Context
  └─> Depends on: Module 3

Module 5: Session Management
  └─> Depends on: Module 3, Module 4

Module 6: Topic Engine
  └─> Depends on: Module 2

Module 7: AI Memory & Context Management
  └─> Depends on: Module 2, Module 4, Module 5

Module 8: Conversation Engine
  └─> Depends on: Module 3, Module 5, Module 6, Module 7

Module 9: Post-Call Feedback
  └─> Depends on: Module 5, Module 8

Module 10: Frontend Foundation
  └─> Depends on: Module 3, Module 5, Module 6
```

---

## Module 1: Project Setup & Infrastructure ✅

**Status**: Completed

**What was built**:
- Monorepo structure (frontend, backend, shared)
- TypeScript configuration
- ESLint, Prettier setup
- Shared types package
- Environment configuration
- Basic project structure

**Files Created**:
- Root `package.json`, `tsconfig.json`, `.prettierrc`
- `shared/` package with types, constants, utils
- `backend/` basic structure
- `frontend/` Next.js setup

---

## Module 2: Database Setup with Prisma

**Status**: Pending

**What to build**:
- Complete Prisma schema (already created)
- Database migrations
- Prisma client setup
- pgvector extension setup
- Seed scripts for initial data

**Files to create**:
- `backend/prisma/migrations/` (auto-generated)
- `backend/prisma/seed.ts`
- Database connection utilities

**Database Setup Steps**:
1. Install PostgreSQL with pgvector extension
2. Create database
3. Run migrations: `npm run db:migrate`
4. Generate Prisma client: `npm run db:generate`
5. Seed initial data: `npm run db:seed`

---

## Module 3: Authentication System

**Status**: Pending

**What to build**:
- JWT token generation and validation
- Password hashing (bcrypt)
- Registration endpoint
- Login endpoint
- Logout endpoint
- Refresh token (optional)
- Protected route middleware
- Auth service layer

**Backend Structure**:
```
backend/src/
├── modules/
│   └── auth/
│       ├── controllers/
│       │   └── authController.ts
│       ├── services/
│       │   └── authService.ts
│       ├── repositories/
│       │   └── userRepository.ts
│       ├── validators/
│       │   └── authValidators.ts
│       ├── middleware/
│       │   └── authMiddleware.ts
│       └── routes.ts
```

**API Endpoints**:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

**Frontend**:
- Login page
- Register page
- Auth context/hooks
- Protected route wrapper

---

## Module 4: User Profile & Context Module

**Status**: Pending

**What to build**:
- User profile CRUD operations
- Context storage (bio, goals)
- Document upload structure (ready for future)
- Context embedding generation (Phase 2)
- Profile service layer

**Backend Structure**:
```
backend/src/
├── modules/
│   └── users/
│       ├── controllers/
│       │   └── profileController.ts
│       ├── services/
│       │   └── profileService.ts
│       │   └── contextService.ts
│       ├── repositories/
│       │   └── profileRepository.ts
│       └── routes.ts
```

**API Endpoints**:
- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/profile/context`
- `POST /api/v1/users/profile/documents` (future)

**Frontend**:
- Profile page
- Onboarding flow
- Context input form

---

## Module 5: Session Management Module

**Status**: Pending

**What to build**:
- Session creation
- Session state management
- Timer logic
- Session termination
- Transcript storage
- Session history retrieval

**Backend Structure**:
```
backend/src/
├── modules/
│   └── sessions/
│       ├── controllers/
│       │   └── sessionController.ts
│       ├── services/
│       │   └── sessionService.ts
│       ├── repositories/
│       │   └── sessionRepository.ts
│       └── routes.ts
```

**API Endpoints**:
- `POST /api/v1/sessions/start`
- `POST /api/v1/sessions/:id/end`
- `GET /api/v1/sessions/:id`
- `GET /api/v1/sessions/history`
- `GET /api/v1/sessions/:id/transcript`

**Frontend**:
- Session start screen
- Timer component
- Session end handler

---

## Module 6: Topic Engine

**Status**: Pending

**What to build**:
- Topic database seeding
- Topic retrieval (list, daily, random)
- Topic selection logic
- Custom topic handling
- Topic-based prompt generation

**Backend Structure**:
```
backend/src/
├── modules/
│   └── topics/
│       ├── controllers/
│       │   └── topicController.ts
│       ├── services/
│       │   └── topicService.ts
│       ├── repositories/
│       │   └── topicRepository.ts
│       └── routes.ts
```

**API Endpoints**:
- `GET /api/v1/topics`
- `GET /api/v1/topics/daily`
- `GET /api/v1/topics/random`

**Frontend**:
- Topic selection UI
- Topic cards

---

## Module 7: AI Memory & Context Management

**Status**: Pending

**What to build**:
- Memory embedding generation (Phase 2 - AI service)
- Vector similarity search with pgvector
- Memory retrieval system
- Context injection into prompts
- Memory summarization after sessions

**Backend Structure**:
```
backend/src/
├── modules/
│   └── memory/
│       ├── controllers/
│       │   └── memoryController.ts
│       ├── services/
│       │   ├── memoryService.ts
│       │   ├── embeddingService.ts (Phase 2)
│       │   └── contextService.ts
│       ├── repositories/
│       │   └── memoryRepository.ts
│       └── routes.ts
```

**API Endpoints**:
- `GET /api/v1/memory/context` - Get relevant memories for user
- `POST /api/v1/memory/generate` - Generate memory from session

**Note**: Embedding generation requires AI service (Phase 2), but structure is ready.

---

## Module 8: Conversation Engine (Text-based MVP)

**Status**: Pending

**What to build**:
- LLM integration (OpenAI/Anthropic)
- Prompt architecture system
- Conversation flow management
- Real-time message handling
- Message storage
- WebSocket structure (ready for voice)

**Backend Structure**:
```
backend/src/
├── modules/
│   └── conversation/
│       ├── controllers/
│       │   └── conversationController.ts
│       ├── services/
│       │   ├── conversationService.ts
│       │   ├── llmService.ts
│       │   └── promptService.ts
│       ├── repositories/
│       │   └── messageRepository.ts
│       └── routes.ts
```

**API Endpoints**:
- `POST /api/v1/conversation/message`
- `GET /api/v1/conversation/:sessionId/messages`
- `WS /api/v1/conversation/stream` (Phase 2)

**Prompt Architecture**:
- System prompt (AI personality)
- User context prompt (from profile + memory)
- Topic prompt
- Conversation history

---

## Module 9: Post-Call Feedback & Mistake Analysis

**Status**: Pending

**What to build**:
- Transcript analysis service
- Mistake detection logic
- Report generation
- JSON storage
- Report retrieval

**Backend Structure**:
```
backend/src/
├── modules/
│   └── feedback/
│       ├── controllers/
│       │   └── feedbackController.ts
│       ├── services/
│       │   ├── feedbackService.ts
│       │   ├── analysisService.ts
│       │   └── reportService.ts
│       ├── repositories/
│       │   └── feedbackRepository.ts
│       └── routes.ts
```

**API Endpoints**:
- `GET /api/v1/feedback/:sessionId`
- `GET /api/v1/feedback/:sessionId/report`

**Frontend**:
- Feedback report page
- Mistake visualization
- Improvement tips display

---

## Module 10: Frontend Foundation

**Status**: Pending

**What to build**:
- shadcn/ui component setup
- React Query setup
- Zustand store setup
- API client utilities
- Auth context/provider
- Protected routes
- Dashboard layout
- Navigation

**Frontend Structure**:
```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── speak/
│   │   └── history/
│   └── layout.tsx
├── components/
│   ├── ui/          # shadcn/ui components
│   └── features/   # Feature components
├── lib/
│   ├── api/        # API clients
│   └── hooks/      # Custom hooks
├── stores/         # Zustand stores
└── services/       # API services
```

---

## Development Order

### Phase 1: MVP (Text-based)
1. ✅ Module 1: Project Setup
2. ⏳ Module 2: Database Setup
3. ⏳ Module 3: Authentication
4. ⏳ Module 10: Frontend Foundation (basic)
5. ⏳ Module 4: User Profile
6. ⏳ Module 6: Topic Engine
7. ⏳ Module 5: Session Management
8. ⏳ Module 8: Conversation Engine (text)
9. ⏳ Module 9: Post-Call Feedback
10. ⏳ Module 7: AI Memory (basic, without embeddings)

### Phase 2: Voice & Advanced
- Voice integration
- Embedding generation
- Advanced memory retrieval
- Pronunciation feedback

---

## Next Steps

1. Complete Module 2: Database Setup
2. Build Module 3: Authentication
3. Continue with remaining modules in order

