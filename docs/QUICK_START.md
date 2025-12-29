# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database

**Prerequisites**: PostgreSQL 14+ with pgvector extension

```bash
# Create database
createdb ai_english_speaker

# Enable pgvector (connect to database first)
psql ai_english_speaker
CREATE EXTENSION vector;
\q
```

### 3. Configure Environment

**Backend**:
```bash
cd backend
cp .env.example .env
# Edit .env with your database URL and JWT secrets
```

**Frontend**:
```bash
cd frontend
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

### 4. Initialize Database
```bash
# From root
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Start Development
```bash
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📁 Project Structure

```
ai-english-speaker/
├── frontend/          # Next.js app
├── backend/           # Express API
├── shared/            # Shared types & utils
├── ARCHITECTURE.md    # Architecture docs
├── MODULES.md         # Module breakdown
└── SETUP.md           # Detailed setup
```

## 🎯 Next Steps

1. ✅ Project setup complete
2. ⏳ Set up database (Module 2)
3. ⏳ Build authentication (Module 3)
4. ⏳ Continue with remaining modules

See [MODULES.md](./MODULES.md) for the complete development plan.

## 📚 Documentation

- **ARCHITECTURE.md**: Detailed architecture and design decisions
- **MODULES.md**: Complete module breakdown with dependencies
- **SETUP.md**: Comprehensive setup instructions
- **PROJECT_STATUS.md**: Current project status

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Code Quality
npm run lint             # Lint all packages
npm run type-check       # Type check all packages
npm run format           # Format code with Prettier

# Build
npm run build            # Build all packages
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure pgvector extension is installed

### Port Already in Use
- Change PORT in backend/.env
- Change port in frontend/package.json scripts

### Module Resolution Errors
```bash
# Rebuild shared package
cd shared && npm run build && cd ..
npm install
```

## 💡 Tips

- Use `npm run db:studio` to view/edit database records
- Check `PROJECT_STATUS.md` for current progress
- Follow module dependencies in `MODULES.md`
- Architecture is future-ready for Redis, BullMQ, etc.

