# Architecture & Module Breakdown

## Project Structure (Monorepo)

```
ai-english-speaker/
├── frontend/              # Next.js App Router
├── backend/              # Express.js API
├── shared/               # Shared types, utilities, constants
├── packages/             # Future: shared packages
└── docs/                # Documentation
```

## Module Breakdown

### Phase 1: Foundation (MVP - Text-based)

#### Module 1: Project Setup & Infrastructure
- Monorepo structure
- TypeScript configuration
- ESLint, Prettier
- Shared types package
- Environment configuration
- Docker setup (optional, future-ready)

#### Module 2: Database & ORM Setup
- PostgreSQL setup
- Prisma schema design
- Database migrations
- pgvector extension setup
- Seed scripts

#### Module 3: Authentication Module
- JWT-based authentication
- Email/password auth
- OAuth structure (ready for future)
- Password hashing (bcrypt)
- Session management
- Protected routes middleware

#### Module 4: User Profile & Context Module
- User profile CRUD
- Context storage (bio, goals)
- Document upload (future-ready)
- Context embedding generation
- Vector storage structure

#### Module 5: Session Management Module
- Session creation/termination
- Timer logic
- Session state management
- Transcript storage
- Session history

#### Module 6: Topic Engine
- Topic database
- Topic selection logic
- Daily topic generation
- Custom topic handling
- Topic-based prompt injection

#### Module 7: AI Memory & Context Management
- Memory embedding generation
- Vector similarity search (pgvector)
- Memory retrieval system
- Context injection into prompts
- Memory summarization

#### Module 8: Conversation Engine (Text-based MVP)
- LLM integration (OpenAI/Anthropic)
- Prompt architecture
- Conversation flow
- Real-time message handling
- WebSocket setup (future-ready for voice)

#### Module 9: Post-Call Feedback & Mistake Analysis
- Transcript analysis
- Mistake detection
- Report generation
- JSON storage
- UI rendering

#### Module 10: Frontend Foundation
- Next.js App Router setup
- shadcn/ui integration
- Tailwind CSS configuration
- React Query setup
- Authentication flow
- Routing structure

### Phase 2: Voice Integration

#### Module 11: Voice System
- WebRTC/WebSocket setup
- Speech-to-Text integration
- Text-to-Speech integration
- Audio streaming
- Real-time conversation

### Phase 3: Advanced Features
- Pronunciation feedback
- Difficulty levels
- Personality modes
- Analytics dashboard

## Architecture Principles

### Scalability
- **Modular Design**: Each module is independent and can scale separately
- **Service Layer**: Clear separation between routes, services, and data access
- **Future-Ready**: Structure allows easy addition of:
  - Redis for caching (add cache layer abstraction)
  - BullMQ for job queues (add job service abstraction)
  - Message queues (add event bus abstraction)
  - Microservices (modules can be extracted)

### Backend Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utilities
│   ├── types/           # TypeScript types
│   ├── validators/      # Input validation
│   └── app.ts           # Express app setup
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── tests/
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # Auth routes
│   │   ├── (dashboard)/ # Protected routes
│   │   └── api/         # API routes (if needed)
│   ├── components/      # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── features/    # Feature components
│   ├── lib/             # Utilities, hooks
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # State management (Zustand/Jotai)
│   ├── types/           # TypeScript types
│   └── services/        # API clients
├── public/
└── styles/
```

### Database Schema (Detailed)

```prisma
User {
  id, email, name, passwordHash, createdAt, updatedAt
  profile, sessions, memories
}

UserProfile {
  id, userId, bio, goals, documents, createdAt, updatedAt
}

Session {
  id, userId, topicId, duration, startedAt, endedAt,
  transcript, summary, status, createdAt, updatedAt
  messages, feedback
}

Message {
  id, sessionId, role (user/assistant), content,
  timestamp, createdAt
}

Memory {
  id, userId, sessionId, content, embedding,
  summary, metadata, createdAt
}

Topic {
  id, name, description, category, isDaily,
  createdAt, updatedAt
}

Feedback {
  id, sessionId, mistakes, improvements, tips,
  reportJson, createdAt
}
```

### API Structure

```
/api/v1/
  /auth
    POST /register
    POST /login
    POST /logout
    POST /refresh
    GET  /me
  
  /users
    GET    /profile
    PUT    /profile
    POST   /profile/context
    POST   /profile/documents
  
  /sessions
    POST   /start
    POST   /:id/end
    GET    /:id
    GET    /history
    GET    /:id/transcript
  
  /conversation
    POST   /message
    GET    /:sessionId/messages
    WS     /stream (future)
  
  /topics
    GET    /
    GET    /daily
    GET    /random
  
  /memory
    GET    /context
    POST   /generate
  
  /feedback
    GET    /:sessionId
    GET    /:sessionId/report
```

### Service Layer Pattern

Each module follows this pattern:
- **Controller**: Handles HTTP requests/responses
- **Service**: Business logic
- **Repository**: Data access (Prisma)
- **Validator**: Input validation (Zod)

### Future-Ready Abstractions

1. **Cache Layer**: Abstract interface for caching
   ```typescript
   interface CacheService {
     get(key: string): Promise<T | null>
     set(key: string, value: T, ttl?: number): Promise<void>
   }
   ```
   - Current: In-memory cache
   - Future: Redis implementation

2. **Job Queue**: Abstract interface for background jobs
   ```typescript
   interface JobQueue {
     add(job: Job): Promise<void>
     process(handler: JobHandler): void
   }
   ```
   - Current: Synchronous processing
   - Future: BullMQ implementation

3. **Event Bus**: Abstract interface for events
   ```typescript
   interface EventBus {
     emit(event: string, data: any): Promise<void>
     on(event: string, handler: EventHandler): void
   }
   ```
   - Current: Direct function calls
   - Future: Message queue implementation

## Development Workflow

1. **Module-by-Module**: Build and test each module independently
2. **Integration Tests**: Test module interactions
3. **Type Safety**: Shared types between frontend/backend
4. **API Contracts**: OpenAPI/Swagger documentation (future)

## Environment Variabless

```env
# Database
DATABASE_URL=
DIRECT_URL=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# OAuth (future)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
NODE_ENV=
PORT=
FRONTEND_URL=
```

## Next Steps

1. ✅ Create architecture document
2. Set up project structure
3. Configure TypeScript, ESLint, Prettier
4. Set up Prisma schema
5. Build Module 1: Authentication

