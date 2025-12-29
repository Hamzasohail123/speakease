# Backend API

Express.js backend for the AI English Speaking Practice App.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up PostgreSQL with pgvector**:
   ```bash
   # Connect to PostgreSQL
   psql -U your_user -d ai_english_speaker
   
   # Run the setup script
   \i scripts/setup-pgvector.sql
   ```

4. **Run migrations**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Seed initial data**:
   ```bash
   npm run db:seed
   ```

6. **Verify setup**:
   ```bash
   npm run db:verify
   ```

7. **Start development server**:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data
- `npm run db:verify` - Verify database setup

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, env)
│   ├── middleware/      # Express middleware
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── sessions/
│   │   ├── topics/
│   │   ├── memory/
│   │   ├── conversation/
│   │   └── feedback/
│   ├── utils/           # Utilities
│   └── index.ts         # Express app entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Seed script
│   └── migrations/      # Database migrations
└── scripts/             # Utility scripts
```

## API Endpoints

### Health Check
- `GET /health` - Health check with database status

### Authentication (Module 3)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Users (Module 4)
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/profile/context` - Update user context

### Sessions (Module 5)
- `POST /api/v1/sessions/start` - Start new session
- `POST /api/v1/sessions/:id/end` - End session
- `GET /api/v1/sessions/:id` - Get session details
- `GET /api/v1/sessions/history` - Get session history

### Topics (Module 6)
- `GET /api/v1/topics` - List all topics
- `GET /api/v1/topics/daily` - Get daily topic
- `GET /api/v1/topics/random` - Get random topic

### Conversation (Module 8)
- `POST /api/v1/conversation/message` - Send message
- `GET /api/v1/conversation/:sessionId/messages` - Get messages

### Memory (Module 7)
- `GET /api/v1/memory/context` - Get user context
- `POST /api/v1/memory/generate` - Generate memory from session

### Feedback (Module 9)
- `GET /api/v1/feedback/:sessionId` - Get feedback
- `GET /api/v1/feedback/:sessionId/report` - Get feedback report

## Environment Variables

See `.env.example` for required environment variables.

## Database

- **ORM**: Prisma
- **Database**: PostgreSQL 14+
- **Extension**: pgvector (for vector embeddings)

## Development

The backend uses:
- **TypeScript** for type safety
- **Express.js** for HTTP server
- **Prisma** for database access
- **Zod** for validation
- **JWT** for authentication

## Module Development

Each module follows this structure:
- `controllers/` - Route handlers
- `services/` - Business logic
- `repositories/` - Data access
- `validators/` - Input validation
- `middleware/` - Module-specific middleware
- `routes.ts` - Route definitions

