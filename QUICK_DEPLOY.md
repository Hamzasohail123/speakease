# ⚡ Quick Deployment Guide

## 🚀 Fastest Way to Deploy (15 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy Backend (Railway - 5 min)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Click **"Add Service"** → **"Empty Service"**
5. In settings:
   - **Root Directory**: `backend`
   - **Start Command**: `npm run db:migrate:deploy && npm start`
6. Go to **Variables** tab and add:
   ```
   DATABASE_URL=your_neon_url
   DIRECT_URL=your_neon_url
   JWT_SECRET=generate_random_string_here
   JWT_REFRESH_SECRET=generate_random_string_here
   FRONTEND_URL=https://your-app.vercel.app (update after frontend deploy)
   OPENAI_API_KEY=your_key
   NODE_ENV=production
   ```
7. Wait for deployment → Copy the URL (e.g., `https://xxx.railway.app`)

### Step 3: Deploy Frontend (Vercel - 5 min)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `cd ../.. && npm install && npm run build --workspace=shared && npm run build --workspace=frontend`
5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
6. Click **"Deploy"**
7. Copy your frontend URL (e.g., `https://xxx.vercel.app`)

### Step 4: Update Backend CORS

1. Go back to Railway
2. Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. Railway will auto-redeploy

### Step 5: Generate JWT Secrets

Run these commands to generate secure secrets:
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

Or use an online generator: https://randomkeygen.com/

---

## ✅ Verify Deployment

1. Visit your Vercel URL → Should see landing page
2. Click "Get Started" → Should redirect to register
3. Create account → Should work!
4. Check backend: `https://your-backend.railway.app/health`

---

## 🎉 Done!

Your app is now live! 🚀

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://your-app.railway.app`

---

## 📝 Important Notes

- **Free tiers** are generous for both platforms
- **Auto-deploy** on every git push
- **SSL/HTTPS** is automatic
- **Custom domains** available in both platforms

---

## 🆘 Troubleshooting

**Backend won't start?**
- Check Railway logs
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

**Frontend can't connect?**
- Verify `NEXT_PUBLIC_API_URL` matches Railway URL
- Check browser console for errors
- Ensure backend is running

**CORS errors?**
- Make sure `FRONTEND_URL` in backend matches Vercel URL exactly
- No trailing slashes!

