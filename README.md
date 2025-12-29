# SpeakEase

A scalable web application for practicing English speaking with an AI partner that remembers past conversations.

## Architecture

This is a monorepo containing:
- **Frontend**: Next.js 14+ (App Router) with React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js API with TypeScript, Prisma ORM, PostgreSQL
- **Shared**: Common types, utilities, and constants

## Tech Stack

### Frontend
- Next.js (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query (React Query)
- Zustand (State Management)

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL + pgvector
- JWT Authentication
- Zod (Validation)

### AI & Voice (Phase 2)
- OpenAI / Anthropic (LLM)
- Speech-to-Text (STT)
- Text-to-Speech (TTS)
- WebRTC / WebSocket

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ with pgvector extension
- npm 9+

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
```

5. Start development servers:
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

## Project Structure

```
├── frontend/          # Next.js application
├── backend/          # Express.js API
├── shared/           # Shared types and utilities
└── docs/             # Documentation (see docs/README.md)
```

## Development

### Module-by-Module Development

We're building this application module by module:

1. ✅ Project Setup & Infrastructure
2. ⏳ Database & ORM Setup
3. ⏳ Authentication Module
4. ⏳ User Profile & Context Module
5. ⏳ Session Management Module
6. ⏳ Topic Engine
7. ⏳ AI Memory & Context Management
8. ⏳ Conversation Engine (Text-based MVP)
9. ⏳ Post-Call Feedback & Mistake Analysis
10. ⏳ Frontend Foundation

### Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Future-Ready Architecture

The architecture is designed to easily add:
- Redis for caching
- BullMQ for job queues
- Message queues for event-driven architecture
- Microservices extraction

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed information.

## 🚀 Deployment

Ready to deploy? Check out our deployment guides:

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Fast 15-minute deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment documentation

### Quick Start

1. **Backend**: Deploy to [Railway](https://railway.app) or [Render](https://render.com)
2. **Frontend**: Deploy to [Vercel](https://vercel.com)
3. **Database**: Already using Neon PostgreSQL

Both platforms offer free tiers perfect for getting started!

## License

Private project

