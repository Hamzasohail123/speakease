# Testing Guide - How to Run Frontend & Backend

This guide will help you test the complete AI English Speaking Practice App.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+) and npm installed
2. **PostgreSQL** database set up (local or cloud)
3. **Environment variables** configured

### Step 1: Install Dependencies

From the **root directory**, run:

```bash
npm install
```

This will install dependencies for all workspaces (frontend, backend, shared).

### Step 2: Set Up Environment Variables

Create `backend/.env` file with:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/ai_english_speaker?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/ai_english_speaker?schema=public"

# JWT (REQUIRED - Generate with: openssl rand -base64 32)
JWT_SECRET="your-jwt-secret-here-minimum-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-here"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# AI Services (Optional for basic testing)
OPENAI_API_KEY="sk-your-key-here"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

Create `frontend/.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 3: Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (topics)
npm run db:seed

# Verify database setup
npm run db:verify
```

### Step 4: Build Shared Package

```bash
npm run build --workspace=shared
```

### Step 5: Run the Application

#### Option A: Run Both Together (Recommended)

From the **root directory**:

```bash
npm run dev
```

This will start:
- **Backend** on `http://localhost:3001`
- **Frontend** on `http://localhost:3000`

#### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

---

## 🧪 Testing the System

### 1. Health Check

Open your browser and visit:
- **Backend Health**: http://localhost:3001/health
- **Frontend**: http://localhost:3000

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": true,
    "pgvectorInstalled": true,
    "tablesExist": true
  }
}
```

### 2. Test User Flow

#### A. Register a New User

1. Go to http://localhost:3000
2. Click "Get Started" or go to http://localhost:3000/register
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Register"
5. You should be redirected to `/dashboard`

#### B. Update Profile

1. Click on your avatar in the header
2. Select "Profile"
3. Add a bio and learning goals
4. Click "Save Profile"

#### C. Browse Topics

1. Click "Topics" in the navigation
2. You should see:
   - Daily Topic (featured)
   - Random Topic
   - All Topics list
3. Click "Start Session" on any topic

#### D. Start a Session

1. Go to `/speak` or click "Speak" in navigation
2. Select:
   - Duration: 10, 15, 20, or 30 minutes
   - Topic: Choose from dropdown or leave as "Random Topic"
3. Click "Start Session"
4. You'll be redirected to `/speak/[sessionId]`

#### E. Have a Conversation

1. In the conversation chat:
   - Type a message (e.g., "Hello, how are you?")
   - Press Enter or click Send
2. Wait for AI response
3. Continue the conversation

**Note**: If you don't have AI API keys configured, you'll get an error. See "AI API Keys" section below.

#### F. End Session

1. Click "End Session" button (or wait for timer to expire)
2. Session will be saved
3. You'll be redirected to dashboard
4. Feedback will be automatically generated

#### G. View History

1. Click "History" in navigation
2. See all your past sessions
3. Click on any session to view details and feedback

---

## 🔑 AI API Keys Setup

For the conversation and feedback features to work, you need AI API keys.

### Quick Setup (OpenAI)

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY="sk-your-key-here"
   ```

### Test Without AI Keys

You can still test:
- ✅ Authentication (register/login)
- ✅ User profiles
- ✅ Session management
- ✅ Topics browsing
- ❌ Conversations (needs API key)
- ❌ Feedback generation (needs API key)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `Cannot find module '@ai-english-speaker/shared'`
```bash
# Solution: Build shared package
npm run build --workspace=shared
```

**Problem**: `PrismaClient is not initialized`
```bash
# Solution: Generate Prisma client
npm run db:generate
```

**Problem**: `Database connection failed`
- Check your `DATABASE_URL` in `backend/.env`
- Verify PostgreSQL is running
- Test connection: `npm run db:verify`

**Problem**: `Port 3001 already in use`
```bash
# Solution: Change PORT in backend/.env or kill the process
lsof -ti:3001 | xargs kill -9
```

### Frontend Issues

**Problem**: `Cannot find module '@ai-english-speaker/shared'`
```bash
# Solution: Build shared package
npm run build --workspace=shared
```

**Problem**: `API calls failing`
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Verify backend is running on port 3001
- Check browser console for CORS errors

**Problem**: `Port 3000 already in use`
```bash
# Solution: Kill the process or use different port
lsof -ti:3000 | xargs kill -9
# Or set PORT=3002 in frontend/.env.local
```

### Database Issues

**Problem**: `Table does not exist`
```bash
# Solution: Run migrations
npm run db:migrate
```

**Problem**: `pgvector extension not found`
- See [NEON_SETUP.md](./NEON_SETUP.md) for Neon
- For local: `CREATE EXTENSION vector;` in psql

---

## 📊 API Testing with curl

### Register User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (with token)
```bash
curl http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Topics
```bash
curl http://localhost:3001/api/v1/topics
```

### Start Session
```bash
curl -X POST http://localhost:3001/api/v1/sessions/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 10,
    "topicId": "topic-id-here"
  }'
```

### Send Message
```bash
curl -X POST http://localhost:3001/api/v1/conversation/send \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-id-here",
    "content": "Hello, how are you?"
  }'
```

---

## ✅ Checklist

Before testing, ensure:

- [ ] Dependencies installed (`npm install`)
- [ ] Database set up and running
- [ ] Environment variables configured
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Migrations run (`npm run db:migrate`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Shared package built (`npm run build --workspace=shared`)
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Health check passes (`/health` endpoint)

---

## 🎯 Expected Behavior

### Successful Flow:

1. **Register** → Redirects to dashboard
2. **Update Profile** → Profile saved successfully
3. **Browse Topics** → Topics load correctly
4. **Start Session** → Session created, redirected to conversation
5. **Send Message** → AI responds (if API key configured)
6. **End Session** → Session saved, feedback generated
7. **View History** → Past sessions visible

### Error Handling:

- Invalid credentials → Error message shown
- Network errors → Toast notification
- API errors → Error message in UI
- Missing API keys → Clear error message

---

## 📝 Next Steps

After testing:

1. **Add AI API keys** for full functionality
2. **Test conversation flow** with real AI responses
3. **Test feedback generation** after sessions
4. **Explore all features** in the dashboard
5. **Check session history** and feedback reports

---

## 🆘 Need Help?

- Check [CREDENTIALS.md](./CREDENTIALS.md) for API key setup
- Check [NEON_SETUP.md](./NEON_SETUP.md) for database setup
- Review backend logs in terminal
- Check browser console for frontend errors
- Verify all environment variables are set

---

Happy Testing! 🚀

