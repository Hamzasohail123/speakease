# 🔧 Render Deployment Fix

## Issue
The build is failing because the `shared` package needs to be built before the backend.

## Solution

### Option 1: Change Root Directory (Recommended)

1. **Remove Root Directory** (set it to empty/blank)
2. **Update Build Command** to:
   ```bash
   cd backend && npm install && npm run build --workspace=../shared && npm run build && npm run db:generate
   ```
3. **Update Start Command** to:
   ```bash
   cd backend && npm run db:migrate:deploy && npm start
   ```

### Option 2: Keep Root Directory as `backend`

**Update Build Command** to:
```bash
cd .. && npm install && npm run build --workspace=shared && cd backend && npm install && npm run build && npm run db:generate
```

**Update Start Command** to:
```bash
npm run db:migrate:deploy && npm start
```

---

## Recommended: Option 1

**Settings:**
- Root Directory: (leave empty/blank)
- Build Command:
  ```bash
  cd backend && npm install && npm run build --workspace=../shared && npm run build && npm run db:generate
  ```
- Start Command:
  ```bash
  cd backend && npm run db:migrate:deploy && npm start
  ```

This ensures the shared package is built first, then the backend.

