# ⚡ Quick Setup Guide

Follow these steps to set up the complete DevOps workflow.

---

## Step 1: Create Develop Branch

```bash
# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

---

## Step 2: Update Backend Environment Variables

1. Go to Render Dashboard → `speakease-backend` → **Environment**
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://speakease.vercel.app
   ```
   (Update with your actual Vercel URL after deployment)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import `Hamzasohail123/speakease`
4. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `cd ../.. && npm install && npm run build --workspace=shared && npm run build --workspace=frontend`
   - **Output Directory**: `.next`
5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://speakease-backend-vxpz.onrender.com
   ```
6. Click **"Deploy"**
7. Copy your frontend URL (e.g., `https://speakease.vercel.app`)

---

## Step 4: Update Backend with Frontend URL

1. Go back to Render Dashboard
2. Update `FRONTEND_URL` with your Vercel URL
3. Service will auto-redeploy

---

## Step 5: Set Up Branch Protection

1. Go to GitHub → Repository → **Settings** → **Branches**
2. Add rule for `main`:
   - ✅ Require pull request reviews (1 approval)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Do not allow force pushes
3. Add rule for `develop`:
   - ✅ Require status checks to pass
   - ✅ Do not allow force pushes

---

## Step 6: Test the Workflow

```bash
# Create a test feature branch
git checkout develop
git pull origin develop
git checkout -b feature/test-workflow

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "feat: test workflow"
git push -u origin feature/test-workflow

# Create PR on GitHub: feature/test-workflow → develop
# Merge the PR
# Verify CI runs successfully
```

---

## Step 7: Verify Deployment

1. **Backend Health**: `https://speakease-backend-vxpz.onrender.com/health`
2. **Frontend**: Visit your Vercel URL
3. **Test**: Create account, login, test features

---

## ✅ Done!

Your DevOps workflow is now set up:
- ✅ Develop branch created
- ✅ Frontend deployed
- ✅ Environment variables configured
- ✅ Branch protection enabled
- ✅ CI pipeline ready

**Next**: Follow the [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md) for daily workflow.

