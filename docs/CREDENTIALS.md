# Credentials & API Keys Guide

This document outlines all the credentials and API keys you need to set up the AI English Speaking Practice App.

## 📋 Required Credentials

### 1. Database Credentials (PostgreSQL)

**Required for**: Module 2 (Database Setup) - **REQUIRED NOW**

You need:
- **PostgreSQL Database** (version 14+)
- **pgvector extension** (for vector embeddings in Phase 2)

#### Setup Options:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib postgresql-14-pgvector

# macOS:
brew install postgresql pgvector

# Create database
createdb ai_english_speaker

# Connect and enable pgvector
psql ai_english_speaker
CREATE EXTENSION vector;
```

**Database Connection String Format:**
```
postgresql://username:password@localhost:5432/ai_english_speaker?schema=public
```

**Example:**
```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/ai_english_speaker?schema=public"
DIRECT_URL="postgresql://postgres:mypassword@localhost:5432/ai_english_speaker?schema=public"
```

**Option B: Cloud PostgreSQL (Recommended for Production)**
- **Neon** (Free tier available): https://neon.tech ⭐ **Recommended**
  - See [NEON_SETUP.md](./NEON_SETUP.md) for detailed setup instructions
  - Easy pgvector setup via SQL Editor
- **Supabase** (Free tier available): https://supabase.com
- **Railway**: https://railway.app
- **AWS RDS**: https://aws.amazon.com/rds
- **Google Cloud SQL**: https://cloud.google.com/sql

All of these support pgvector extension.

---

### 2. JWT Secrets

**Required for**: Module 3 (Authentication) - **REQUIRED NOW**

Generate secure random strings for JWT signing:

```bash
# Generate JWT secrets (run these commands)
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

**Example:**
```env
JWT_SECRET="your-generated-secret-key-here-minimum-32-characters"
JWT_REFRESH_SECRET="your-generated-refresh-secret-key-here"
JWT_EXPIRES_IN="7d"              # Access token expiry
JWT_REFRESH_EXPIRES_IN="30d"     # Refresh token expiry
```

**Note**: Never commit these secrets to git! Keep them in `.env` file.

---

### 3. AI/LLM API Keys (Phase 2 - Not Required Yet)

**Required for**: 
- Module 7 (AI Memory - Embeddings)
- Module 8 (Conversation Engine)
- Module 9 (Post-Call Feedback)

#### Option A: OpenAI (Recommended)

**What you need:**
- OpenAI API key
- Access to `text-embedding-ada-002` or `text-embedding-3-small` (for embeddings)
- Access to `gpt-4` or `gpt-3.5-turbo` (for conversations)

**How to get:**
1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to API Keys: https://platform.openai.com/api-keys
4. Create a new secret key
5. Copy the key (starts with `sk-...`)

**Cost**: 
- Embeddings: ~$0.0001 per 1K tokens
- GPT-4: ~$0.03 per 1K input tokens, $0.06 per 1K output tokens
- GPT-3.5-turbo: ~$0.0015 per 1K tokens (much cheaper)

**Environment Variable:**
```env
OPENAI_API_KEY="sk-your-api-key-here"
```

#### Option B: Anthropic (Claude)

**What you need:**
- Anthropic API key
- Access to Claude models

**How to get:**
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Go to API Keys
4. Create a new key
5. Copy the key (starts with `sk-ant-...`)

**Cost**: Similar to OpenAI

**Environment Variable:**
```env
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
```

**Note**: For embeddings with Anthropic, you might need to use a separate embedding service or OpenAI's embedding API.

#### Option C: Open Source / Self-Hosted (Advanced)

- **Ollama** (Local LLM): https://ollama.ai
- **LocalAI**: https://localai.io
- **Hugging Face** (Free tier available): https://huggingface.co

---

### 4. Speech-to-Text (STT) API Keys (Phase 2 - Voice Features)

**Required for**: Module 8 (Voice Conversation)

#### Option A: OpenAI Whisper API

**How to get:**
- Same OpenAI account as above
- Use the same `OPENAI_API_KEY`

**Cost**: $0.006 per minute

#### Option B: Google Cloud Speech-to-Text

**How to get:**
1. Go to https://cloud.google.com
2. Create a project
3. Enable Speech-to-Text API
4. Create service account and download JSON key

**Cost**: First 60 minutes free per month, then $0.006 per 15 seconds

**Environment Variables:**
```env
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_KEY_FILE="path/to/service-account-key.json"
```

#### Option C: AssemblyAI

**How to get:**
1. Go to https://www.assemblyai.com
2. Sign up (free tier: 5 hours/month)
3. Get API key

**Cost**: Free tier available, then $0.00025 per second

**Environment Variable:**
```env
ASSEMBLYAI_API_KEY="your-api-key"
```

---

### 5. Text-to-Speech (TTS) API Keys (Phase 2 - Voice Features)

**Required for**: Module 8 (Voice Conversation)

#### Option A: OpenAI TTS

**How to get:**
- Same OpenAI account
- Use the same `OPENAI_API_KEY`

**Cost**: $15 per 1M characters

#### Option B: Google Cloud Text-to-Speech

**How to get:**
- Same Google Cloud project as STT
- Enable Text-to-Speech API

**Cost**: First 4M characters free per month, then $4 per 1M characters

#### Option C: ElevenLabs (Best Quality)

**How to get:**
1. Go to https://elevenlabs.io
2. Sign up (free tier: 10K characters/month)
3. Get API key

**Cost**: Free tier available, then $5 per 100K characters

**Environment Variable:**
```env
ELEVENLABS_API_KEY="your-api-key"
```

---

### 6. OAuth Credentials (Optional - Future)

**Required for**: OAuth login (Google, GitHub, etc.)

#### Google OAuth

**How to get:**
1. Go to https://console.cloud.google.com
2. Create a project
3. Go to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

**Environment Variables:**
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

---

## 🚀 Quick Setup Checklist

### For MVP (Text-based, No Voice) - Required Now:

- [ ] **PostgreSQL Database** (local or cloud)
- [ ] **pgvector extension** enabled
- [ ] **JWT secrets** generated
- [ ] **Database connection string** configured

### For Phase 2 (Voice + AI Features):

- [ ] **OpenAI API Key** (or Anthropic)
- [ ] **STT API Key** (OpenAI Whisper or Google)
- [ ] **TTS API Key** (OpenAI, Google, or ElevenLabs)

### Optional (Future):

- [ ] **OAuth credentials** (Google, GitHub, etc.)
- [ ] **Redis** (for caching - optional)
- [ ] **BullMQ** (for job queues - optional)

---

## 📝 Environment File Template

Create `backend/.env` with:

```env
# Database (REQUIRED NOW)
DATABASE_URL="postgresql://user:password@localhost:5432/ai_english_speaker?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/ai_english_speaker?schema=public"

# JWT (REQUIRED NOW)
JWT_SECRET="generate-with-openssl-rand-base64-32"
JWT_REFRESH_SECRET="generate-with-openssl-rand-base64-32"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# AI Services (Phase 2 - Optional for now)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""

# Speech Services (Phase 2 - Optional for now)
ASSEMBLYAI_API_KEY=""
ELEVENLABS_API_KEY=""

# OAuth (Future - Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Redis (Future - Optional)
REDIS_URL="redis://localhost:6379"
```

---

## 💰 Cost Estimates

### Development/Testing:
- **PostgreSQL**: Free (local) or Free tier (Supabase/Neon)
- **OpenAI**: ~$5-20/month for testing
- **Total**: ~$5-20/month

### Production (100 active users):
- **PostgreSQL**: $0-25/month (cloud hosting)
- **OpenAI API**: ~$50-200/month (depending on usage)
- **STT/TTS**: ~$20-50/month
- **Total**: ~$70-275/month

### Cost Optimization Tips:
1. Use GPT-3.5-turbo instead of GPT-4 for conversations
2. Cache embeddings (don't regenerate for same content)
3. Use free tiers where possible (Supabase, Neon)
4. Implement rate limiting
5. Use local models for development (Ollama)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to git
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Rotate API keys** regularly
4. **Use environment-specific keys** (dev, staging, prod)
5. **Limit API key permissions** (read-only where possible)
6. **Monitor API usage** to detect anomalies
7. **Use secrets management** in production (AWS Secrets Manager, etc.)

---

## 📚 Resources

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Anthropic API Docs**: https://docs.anthropic.com
- **PostgreSQL + pgvector**: https://github.com/pgvector/pgvector
- **Supabase** (Free PostgreSQL): https://supabase.com
- **Neon** (Serverless PostgreSQL): https://neon.tech

---

## ❓ FAQ

**Q: Do I need all credentials now?**  
A: No! For MVP (text-based), you only need:
- PostgreSQL database
- JWT secrets
- AI keys are needed later for Phase 2

**Q: Can I use free tiers?**  
A: Yes! Many services offer free tiers:
- Supabase/Neon: Free PostgreSQL
- OpenAI: $5 free credit
- AssemblyAI: 5 hours/month free
- ElevenLabs: 10K characters/month free

**Q: What's the cheapest option?**  
A: For development:
- Local PostgreSQL (free)
- OpenAI free credit ($5)
- Use GPT-3.5-turbo (cheaper than GPT-4)

**Q: Can I test without AI keys?**  
A: Yes! You can build and test:
- Authentication ✅
- User profiles ✅
- Sessions ✅
- Topics ✅
- Database ✅

AI features (conversations, embeddings) need API keys.

---

## 🎯 Next Steps

1. **Set up PostgreSQL** (local or cloud)
2. **Generate JWT secrets**
3. **Create `.env` file** with database and JWT credentials
4. **Test database connection**: `npm run db:verify`
5. **Run migrations**: `npm run db:migrate`
6. **Start building!** 🚀

AI keys can be added later when you reach Phase 2 modules.

