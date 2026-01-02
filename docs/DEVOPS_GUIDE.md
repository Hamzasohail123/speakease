# 🚀 Complete DevOps & Deployment Guide

This guide covers Git workflow, branching strategy, frontend deployment, and best practices for solo development.

---

## 📋 Table of Contents

1. [Git Branching Strategy](#git-branching-strategy)
2. [Development Workflow](#development-workflow)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Environment Variables Setup](#environment-variables-setup)
5. [CI/CD Best Practices](#cicd-best-practices)
6. [Testing Strategy](#testing-strategy)
7. [Monitoring & Logging](#monitoring--logging)

---

## 🌿 Git Branching Strategy

### Branch Structure

```
main (production)
  ├── develop (development)
  ├── feature/feature-name
  ├── bugfix/bug-name
  └── hotfix/hotfix-name
```

### Branch Purposes

- **`main`**: Production-ready code. Always deployable.
- **`develop`**: Integration branch for features. Latest development code.
- **`feature/*`**: New features. Branch from `develop`, merge back to `develop`.
- **`bugfix/*`**: Bug fixes. Branch from `develop`, merge back to `develop`.
- **`hotfix/*`**: Critical production fixes. Branch from `main`, merge to both `main` and `develop`.

### Initial Setup

```bash
# Create develop branch
git checkout -b develop
git push -u origin develop

# Protect main branch (GitHub Settings → Branches)
# - Require pull request reviews
# - Require status checks to pass
# - Require branches to be up to date
```

---

## 🔄 Development Workflow

### Daily Workflow

#### Starting a New Feature

```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/add-new-feature

# 3. Work on feature
# ... make changes ...

# 4. Commit changes
git add .
git commit -m "feat: add new feature description"

# 5. Push feature branch
git push -u origin feature/add-new-feature

# 6. Create Pull Request on GitHub
# - Base: develop
# - Compare: feature/add-new-feature
# - Review and merge
```

#### Bug Fix Workflow

```bash
# 1. Create bugfix branch from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-login-issue

# 2. Fix the bug
# ... make changes ...

# 3. Commit and push
git add .
git commit -m "fix: resolve login authentication issue"
git push -u origin bugfix/fix-login-issue

# 4. Create PR to develop
```

#### Hotfix Workflow (Production Issues)

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Fix the issue
# ... make changes ...

# 3. Commit and push
git add .
git commit -m "hotfix: fix critical security vulnerability"
git push -u origin hotfix/critical-security-fix

# 4. Create PR to main
# 5. After merging to main, also merge to develop
```

#### Deploying to Production

```bash
# 1. Ensure develop is up to date
git checkout develop
git pull origin develop

# 2. Merge develop into main
git checkout main
git pull origin main
git merge develop

# 3. Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# 4. Deploy (automatic via Render/Vercel)
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Import repository: `Hamzasohail123/speakease`
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `cd ../.. && npm install && npm run build --workspace=shared && npm run build --workspace=frontend`
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 3: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Production
NEXT_PUBLIC_API_URL=https://speakease-backend-vxpz.onrender.com

# Preview (for PR deployments)
NEXT_PUBLIC_API_URL=https://speakease-backend-vxpz.onrender.com
```

### Step 4: Branch Configuration

1. Go to **Settings** → **Git**
2. Configure:
   - **Production Branch**: `main`
   - **Preview Deployments**: Enable for all branches
   - **Automatic Deployments**: Enable

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Copy your frontend URL: `https://speakease.vercel.app`

---

## 🔐 Environment Variables Setup

### Backend (Render)

Update in Render Dashboard → Environment:

```bash
# Database (already set)
DATABASE_URL=postgresql://...

# JWT (already set)
JWT_SECRET=...
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=production

# OpenAI
OPENAI_API_KEY=sk-...

# Frontend URL (UPDATE THIS!)
FRONTEND_URL=https://speakease.vercel.app

# Optional: Email
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### Frontend (Vercel)

Add in Vercel Dashboard → Settings → Environment Variables:

```bash
# Production
NEXT_PUBLIC_API_URL=https://speakease-backend-vxpz.onrender.com

# Preview (for PR previews)
NEXT_PUBLIC_API_URL=https://speakease-backend-vxpz.onrender.com

# Development (local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Local Development (.env files)

**Backend** (`backend/.env`):
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=local-dev-secret-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important**: Add `.env` and `.env.local` to `.gitignore`!

---

## 🔄 CI/CD Best Practices

### GitHub Actions (Optional but Recommended)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Lint shared
        run: npm run lint --workspace=shared
      
      - name: Lint backend
        run: npm run lint --workspace=backend
      
      - name: Lint frontend
        run: npm run lint --workspace=frontend
      
      - name: Type check
        run: npm run type-check
      
      - name: Build shared
        run: npm run build --workspace=shared
      
      - name: Build backend
        run: npm run build --workspace=backend
      
      - name: Build frontend
        run: npm run build --workspace=frontend
```

### Branch Protection Rules

**For `main` branch:**
- Require pull request reviews (1 approval)
- Require status checks to pass
- Require branches to be up to date
- Do not allow force pushes
- Do not allow deletions

**For `develop` branch:**
- Require pull request reviews (optional for solo dev)
- Require status checks to pass
- Do not allow force pushes

---

## 🧪 Testing Strategy

### Pre-Commit Checklist

Before committing, ensure:
- [ ] Code compiles without errors
- [ ] TypeScript type checks pass
- [ ] Linter passes
- [ ] No console.logs left in code
- [ ] Environment variables are set correctly
- [ ] Database migrations are up to date

### Pre-Deploy Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] Code reviewed (self-review for solo dev)
- [ ] Environment variables updated
- [ ] Database migrations tested
- [ ] Frontend and backend URLs match
- [ ] Health checks working
- [ ] No sensitive data in logs

---

## 📊 Monitoring & Logging

### Render Monitoring

1. **Logs**: View in Render Dashboard → Logs
2. **Metrics**: Monitor CPU, Memory, Network
3. **Health Checks**: Automatic via `/health` endpoint
4. **Alerts**: Set up email notifications for failures

### Vercel Monitoring

1. **Analytics**: Enable in Vercel Dashboard
2. **Logs**: View function logs
3. **Performance**: Monitor Core Web Vitals
4. **Deployments**: Track deployment history

### Error Tracking (Optional)

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **PostHog** for analytics

---

## 🚨 Emergency Procedures

### Rollback Deployment

**Backend (Render):**
1. Go to Deploys tab
2. Find previous successful deployment
3. Click "Redeploy"

**Frontend (Vercel):**
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

### Database Rollback

```bash
# Connect to database
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>
```

### Quick Fix Process

1. Create hotfix branch from main
2. Fix the issue
3. Test locally
4. Deploy to production
5. Merge back to develop

---

## 📝 Commit Message Convention

Use conventional commits:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

Examples:
- `feat: add call with AI feature`
- `fix: resolve audio playback issue`
- `docs: update deployment guide`
- `chore: update dependencies`

---

## 🔒 Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Rotate keys regularly**: Especially JWT secrets
3. **Use strong passwords**: For database and services
4. **Enable 2FA**: On GitHub, Render, Vercel
5. **Review dependencies**: Run `npm audit` regularly
6. **Keep dependencies updated**: Security patches

---

## 📚 Additional Resources

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## ✅ Quick Start Checklist

### Initial Setup

- [ ] Create `develop` branch
- [ ] Set up branch protection rules
- [ ] Configure GitHub Actions (optional)
- [ ] Set up Vercel for frontend
- [ ] Update backend `FRONTEND_URL`
- [ ] Update frontend `NEXT_PUBLIC_API_URL`
- [ ] Test end-to-end deployment

### Daily Workflow

- [ ] Work on feature branches
- [ ] Create PRs to `develop`
- [ ] Test locally before pushing
- [ ] Use conventional commits
- [ ] Deploy to production from `main` only

---

**Ready to implement? Let's start! 🚀**

