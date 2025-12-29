# 🚀 Deployment Guide

This guide will help you deploy your SpeakEase application to production.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Railway or Render account (for backend)
- Neon PostgreSQL database (already set up)
- OpenAI API key (for voice features)

## 🏗️ Architecture

- **Frontend**: Next.js → Deploy to **Vercel** (recommended)
- **Backend**: Express.js → Deploy to **Railway** or **Render**
- **Database**: Neon PostgreSQL (already configured)

---

## 🎯 Option 1: Vercel + Railway (Recommended)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the repository

3. **Configure Service**
   - Railway will auto-detect Node.js
   - Set **Root Directory** to: `backend`
   - Set **Start Command** to: `npm run db:migrate:deploy && npm start`

4. **Set Environment Variables**
   Add these in Railway dashboard → Variables:
   ```
   DATABASE_URL=your_neon_database_url
   DIRECT_URL=your_neon_direct_url
   JWT_SECRET=your_jwt_secret (generate a strong random string)
   JWT_REFRESH_SECRET=your_refresh_secret (generate a strong random string)
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key (optional)
   ```

5. **Deploy**
   - Railway will automatically build and deploy
   - Note the generated URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `cd ../.. && npm run build --workspace=shared && npm run build --workspace=frontend`
   - **Output Directory**: `.next`

4. **Set Environment Variables**
   Add in Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://your-app.vercel.app`

### Step 3: Update Backend CORS

1. Go back to Railway
2. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. Redeploy the backend

---

## 🎯 Option 2: Vercel + Render

### Step 1: Deploy Backend to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `speakease-backend`
     - **Environment**: `Node`
     - **Root Directory**: `backend`
     - **Build Command**: `cd ../.. && npm install && npm run build --workspace=shared && npm run build --workspace=backend`
     - **Start Command**: `cd backend && npm run db:migrate:deploy && npm start`

3. **Set Environment Variables**
   Same as Railway (see above)

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy
   - Note the URL: `https://your-app.onrender.com`

### Step 2: Deploy Frontend to Vercel

Same as Option 1, Step 2, but use Render backend URL:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## 🔐 Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | Neon direct connection (for migrations) | Same as DATABASE_URL |
| `JWT_SECRET` | Secret for JWT tokens | Generate with: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Generate with: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3001` (auto-set by platform) |
| `FRONTEND_URL` | Frontend domain | `https://your-app.vercel.app` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | `sk-ant-...` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.railway.app` |

---

## 🔧 Post-Deployment Steps

### 1. Run Database Migrations

The backend will automatically run migrations on startup (via `db:migrate:deploy`).

### 2. Seed Initial Data (Optional)

If you want to seed topics, SSH into your backend or run:
```bash
npm run db:seed --workspace=backend
```

### 3. Verify Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Visit `https://your-backend-url/health`
3. **Test**: Create an account and start a session

### 4. Update CORS

Make sure `FRONTEND_URL` in backend matches your Vercel domain.

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Database connection errors
- **Solution**: Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check Neon dashboard for connection string

**Issue**: Migration failures
- **Solution**: Ensure `DIRECT_URL` is set (required for migrations)
- Check Prisma logs in deployment logs

**Issue**: CORS errors
- **Solution**: Verify `FRONTEND_URL` matches your Vercel domain exactly
- Check backend logs for CORS errors

### Frontend Issues

**Issue**: API connection errors
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is correct
- Check browser console for network errors
- Ensure backend is running and accessible

**Issue**: Build failures
- **Solution**: Check that shared package builds first
- Verify all dependencies are in `package.json`

---

## 🔄 Continuous Deployment

Both Vercel and Railway/Render support automatic deployments:
- **Push to `main` branch** → Auto-deploy
- **Pull requests** → Preview deployments (Vercel)

---

## 📊 Monitoring

### Vercel
- View analytics in Vercel dashboard
- Check function logs
- Monitor performance

### Railway
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts

### Render
- View logs in Render dashboard
- Monitor uptime
- Set up health checks

---

## 🎉 You're Live!

Once deployed:
1. Share your frontend URL with users
2. Monitor logs for any issues
3. Set up custom domains (optional)
4. Enable analytics (optional)

---

## 📝 Notes

- **Free Tiers**: Both Vercel and Railway/Render offer generous free tiers
- **Custom Domains**: You can add custom domains in both platforms
- **SSL**: Automatically handled by both platforms
- **Scaling**: Both platforms auto-scale based on traffic

---

## 🆘 Need Help?

- Check platform documentation:
  - [Vercel Docs](https://vercel.com/docs)
  - [Railway Docs](https://docs.railway.app)
  - [Render Docs](https://render.com/docs)

