# Testing Guide

## 🧪 Quick Test Checklist

Before continuing to build more modules, let's test what we've built so far:

### Prerequisites Check
- [ ] PostgreSQL database is set up
- [ ] pgvector extension is installed
- [ ] Environment variables are configured (`backend/.env`)
- [ ] Dependencies are installed (`npm install`)

### Step 1: Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial topics (optional, but helpful)
npm run db:seed

# Verify database setup
npm run db:verify
```

### Step 2: Start Backend
```bash
npm run dev:backend
```

You should see:
```
🚀 Server running on port 3001
📝 Environment: development
✅ Database connected successfully
```

### Step 3: Test Health Endpoint
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "database": {
    "connected": true,
    "pgvectorInstalled": true,
    "tablesExist": true
  }
}
```

### Step 4: Test Authentication

#### Register a User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "message": "User registered successfully"
}
```

**Save the token** for next requests!

#### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

#### Get Current User (Protected)
```bash
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 5: Test User Profile

#### Get Profile
```bash
curl http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Update Profile
```bash
curl -X PUT http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "I am learning English",
    "goals": ["Improve fluency", "Job interviews"]
  }'
```

### Step 6: Test Session Management

#### Start Session
```bash
curl -X POST http://localhost:3001/api/v1/sessions/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 10
  }'
```

#### Get Session
```bash
curl http://localhost:3001/api/v1/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### End Session
```bash
curl -X POST http://localhost:3001/api/v1/sessions/SESSION_ID/end \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "User: Hello\nAssistant: Hi there!",
    "summary": "Greeting conversation"
  }'
```

#### Get Session History
```bash
curl http://localhost:3001/api/v1/sessions/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Common Issues

### Database Connection Error
**Error**: `Database connection failed`

**Solution**:
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify `DATABASE_URL` in `backend/.env`
3. Test connection: `psql $DATABASE_URL`

### Missing Environment Variables
**Error**: `Missing required environment variable: JWT_SECRET`

**Solution**:
1. Copy `.env.example` to `.env`
2. Generate secrets: `openssl rand -base64 32`
3. Fill in all required variables

### Module Not Found Error
**Error**: `Cannot find module '@ai-english-speaker/shared'`

**Solution**:
```bash
# Rebuild shared package
cd shared && npm run build && cd ..

# Reinstall dependencies
npm install
```

### Port Already in Use
**Error**: `Port 3001 is already in use`

**Solution**:
- Change `PORT` in `backend/.env`
- Or kill the process: `lsof -ti:3001 | xargs kill`

## ✅ What to Verify

After testing, you should confirm:
- [x] Database connection works
- [x] User registration works
- [x] User login works
- [x] JWT authentication works
- [x] Profile creation/update works
- [x] Session creation works
- [x] Session ending works
- [x] Session history works

## 🚀 Next Steps

Once everything is tested and working:
1. Continue with Module 6: Topic Engine
2. Then Module 8: Conversation Engine
3. Then Module 7: AI Memory
4. Finally Module 9: Post-Call Feedback

## 📝 Testing with Postman/Insomnia

If you prefer a GUI tool:
1. Import the endpoints above
2. Set up environment variables for `token`
3. Test all endpoints

## 🎯 Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"
EMAIL="test@example.com"
PASSWORD="Test1234"

echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

echo "2. Getting profile..."
curl -s $BASE_URL/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN" | jq

echo "3. Starting session..."
SESSION_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/sessions/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"duration": 10}')

SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.data.session.id')
echo "Session ID: $SESSION_ID"

echo "4. Getting session history..."
curl -s $BASE_URL/api/v1/sessions/history \
  -H "Authorization: Bearer $TOKEN" | jq

echo "✅ All tests passed!"
```

Run with: `chmod +x test-api.sh && ./test-api.sh`

