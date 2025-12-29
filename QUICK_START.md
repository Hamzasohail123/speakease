# 🚀 Quick Start Guide

## Run the Application

### Option 1: Run Both Together (Easiest)

```bash
npm run dev
```

This starts:
- **Backend** → http://localhost:3001
- **Frontend** → http://localhost:3000

### Option 2: Run Separately

**Terminal 1 (Backend):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend):**
```bash
npm run dev:frontend
```

---

## First Time Setup

If this is your first time running:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

3. **Build shared package:**
   ```bash
   npm run build --workspace=shared
   ```

4. **Check environment variables:**
   - `backend/.env` should exist (✅ you have this)
   - `frontend/.env.local` should exist (✅ just created)

5. **Verify database:**
   ```bash
   npm run db:verify
   ```

---

## Test the System

1. **Open browser:** http://localhost:3000
2. **Register** a new account
3. **Update your profile**
4. **Browse topics** and start a session
5. **Have a conversation** with the AI

**Note:** For AI conversations to work, you need API keys in `backend/.env`:
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

See [docs/CREDENTIALS.md](./docs/CREDENTIALS.md) for details.

---

## Troubleshooting

**Backend won't start:**
- Check `backend/.env` has all required variables
- Verify database connection: `npm run db:verify`

**Frontend won't start:**
- Check `frontend/.env.local` exists
- Build shared package: `npm run build --workspace=shared`

**Module not found errors:**
```bash
npm run build --workspace=shared
```

**Database errors:**
```bash
npm run db:migrate
npm run db:seed
```

---

## Full Testing Guide

See [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) for comprehensive testing instructions.

