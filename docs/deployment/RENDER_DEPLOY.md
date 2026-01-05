# 🚀 Quick Deploy to Render (15 Minutes)

Deploy your **SpeakEase** platform to production for FREE using Render and Vercel.

---

## 📋 Prerequisites

- GitHub account with your code pushed
- OpenAI API key (for AI features)
- Gmail account (for email notifications)

---

## Part 1: Deploy Backend to Render (10 min)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account
4. Authorize Render to access your repositories

---

### Step 2: Create PostgreSQL Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `speakease-db`
   - **Database**: `speakease`
   - **User**: `speakease_user` (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free**
3. Click **"Create Database"**
4. Wait 2-3 minutes for database to be ready
5. **Copy the "Internal Database URL"** (starts with `postgresql://`)
   - You'll need this for the backend service

---

### Step 3: Deploy Backend Service

1. From Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Hamzasohail123/speakease`
3. Configure:
   - **Name**: `speakease-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     cd backend && npm install --include=dev && cd ../shared && npm install && npm run build && cd ../backend && npm run build && npm run db:generate
     ```
   - **Start Command**: 
     ```bash
     cd backend && npm run db:migrate:deploy && npm start
     ```
   - **Plan**: **Free**

4. Click **"Advanced"** → Add Environment Variables:

```bash
# Database
DATABASE_URL=<paste-internal-database-url-from-step-2>

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# JWT Expiry
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=production

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-api-key

# Optional: Anthropic API Key (if you want Claude as fallback)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Email Configuration (for feedback form)
GMAIL_USER=hamzasohail429@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Frontend URL (we'll update this after deploying frontend)
FRONTEND_URL=http://localhost:3000
```

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for deployment
7. **Copy your backend URL**: `https://speakease-backend.onrender.com`

---

### Step 4: Enable pgvector Extension

1. Go to your database in Render Dashboard
2. Click **"Connect"** → Copy the **External Database URL**
3. Use a PostgreSQL client or Render's shell:
   - Click **"Shell"** tab in your database
   - Run:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```
4. Verify:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

---

## Part 2: Deploy Frontend to Vercel (5 min)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with your GitHub account

---

### Step 2: Deploy Frontend

1. Click **"Add New..."** → **"Project"**
2. Import `Hamzasohail123/speakease` repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. Add Environment Variables:
   ```bash
   NEXT_PUBLIC_API_URL=https://speakease-backend.onrender.com
   ```

5. Click **"Deploy"**
6. Wait 2-3 minutes
7. **Copy your frontend URL**: `https://speakease.vercel.app`

---

### Step 3: Update Backend Environment

1. Go back to Render Dashboard
2. Open your `speakease-backend` service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL`:
   ```bash
   FRONTEND_URL=https://speakease.vercel.app
   ```
5. Click **"Save Changes"**
6. Service will automatically redeploy

---

## 🎉 You're Live!

Your SpeakEase platform is now deployed:

- **Frontend**: `https://speakease.vercel.app`
- **Backend**: `https://speakease-backend.onrender.com`
- **Database**: Render PostgreSQL (managed)

---

## 🔧 Post-Deployment Setup

### 1. Test Your Deployment

Visit your frontend URL and:
- ✅ Create an account
- ✅ Start a practice session
- ✅ Try voice conversation
- ✅ Check session history
- ✅ View feedback

### 2. Set Up Custom Domain (Optional)

**For Frontend (Vercel):**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**For Backend (Render):**
1. Go to Service Settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records

---

## 📊 Monitor Your App

### Render Dashboard
- View logs: Service → Logs tab
- Monitor metrics: Service → Metrics tab
- Database stats: Database → Metrics tab

### Vercel Dashboard
- View deployments: Project → Deployments
- Check analytics: Project → Analytics
- Monitor performance: Project → Speed Insights

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render:**
- ⏰ Service spins down after 15 min of inactivity
- 🐌 Cold start takes ~30 seconds
- 💾 Database: 1GB storage, 90-day data retention
- 🔄 Keep-alive: Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 14 minutes

**Vercel:**
- ✅ No cold starts for frontend
- 📊 100GB bandwidth/month
- ⚡ Serverless functions: 100GB-hours

### Keep Your Backend Awake (Optional)

Create a free [UptimeRobot](https://uptimerobot.com) monitor:
1. Sign up for free
2. Add new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://speakease-backend.onrender.com/health`
   - **Interval**: 14 minutes
3. This prevents cold starts!

---

## 🔐 Security Checklist

- ✅ Change `JWT_SECRET` to a strong random string
- ✅ Keep API keys in environment variables (never commit them)
- ✅ Use Gmail App Password (not your actual password)
- ✅ Enable 2FA on your Render and Vercel accounts
- ✅ Regularly update dependencies: `npm audit fix`

---

## 🐛 Troubleshooting

### Backend Won't Start
1. Check logs in Render Dashboard
2. Verify `DATABASE_URL` is correct
3. Ensure all required env vars are set
4. Check build logs for errors

### Database Connection Failed
1. Verify pgvector extension is installed
2. Check `DATABASE_URL` format
3. Ensure database is in "Available" state
4. Try running migrations manually in Render Shell

### Frontend Can't Connect to Backend
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS settings in backend
3. Ensure backend is running (visit `/health` endpoint)
4. Check browser console for errors

### Cold Start Issues
1. First request after inactivity takes ~30s (normal)
2. Set up UptimeRobot to prevent cold starts
3. Consider upgrading to paid plan for always-on service

---

## 💰 Upgrade Options

When you're ready to scale:

**Render:**
- **Starter Plan** ($7/month): No cold starts, more resources
- **Standard Plan** ($25/month): Auto-scaling, more RAM

**Vercel:**
- **Pro Plan** ($20/month): More bandwidth, better analytics
- **Enterprise**: Custom pricing

---

## 🎓 Next Steps

1. **Add Custom Domain**: Make it professional with your own domain
2. **Set Up Monitoring**: Use UptimeRobot or similar
3. **Enable Analytics**: Track user behavior with Vercel Analytics
4. **Optimize Performance**: Monitor and improve load times
5. **Add More Features**: Continue building your platform!

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL on Render](https://render.com/docs/databases)

---

## 🆘 Need Help?

- **Render Support**: https://render.com/docs/support
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: Create an issue in your repository

---

**Congratulations! Your SpeakEase platform is now live! 🎊**

Share your deployed app:
- Frontend: `https://speakease.vercel.app`
- Add it to your portfolio
- Share on LinkedIn/Twitter
- Show it to potential employers!

---

*Deployment time: ~15 minutes | Cost: $0/month | Scalability: ⭐⭐⭐⭐*

