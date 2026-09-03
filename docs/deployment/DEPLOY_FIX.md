# 🔧 Render Deployment Configuration

## Recommended Settings

**Root Directory:** `backend`

**Build Command:**
```bash
cd backend && npm install --include=dev && cd ../shared && npm install && npm run build && cd ../backend && npm run build && npm run db:generate
```

**Start Command:**
```bash
cd backend && npm run db:migrate:deploy && npm start
```

## What This Does

1. **Build Command:**
   - Installs backend dependencies (including dev dependencies for TypeScript)
   - Builds the shared package first (required dependency)
   - Builds the backend application
   - Generates Prisma client

2. **Start Command:**
   - Runs database migrations
   - Starts the server

## Why `--include=dev`?

TypeScript and `@types/node` are in devDependencies, but they're needed during the build process. The `--include=dev` flag ensures they're installed even in production builds.

