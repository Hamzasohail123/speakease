# 📊 SpeakEase Monitoring Guide

Complete guide to monitor your platform, track users, and receive notifications.

---

## 🔔 Email Notifications

### What You'll Receive

You'll automatically get email notifications for:
1. **New User Signups** 🎉 - Instant notification when someone creates an account
2. **User Feedback** 💬 - When users submit feedback through the dashboard
3. **System Events** ⚠️ - Important platform events

All notifications are sent to: **hamzasohail429@gmail.com**

---

## 🛠️ Setup Email Notifications

### Option 1: Gmail App Password (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "SpeakEase Platform"
   - Copy the 16-character password

3. **Add to Environment Variables**:
   ```bash
   GMAIL_USER=hamzasohail429@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-app-password
   ```

### Option 2: Generic SMTP

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hamzasohail429@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@speakease.com
```

---

## ✅ Test Email Configuration

### Method 1: API Endpoint

Once your backend is deployed, visit:

```
https://your-backend-url.onrender.com/api/v1/admin/test-email
```

You should see:
```json
{
  "success": true,
  "message": "Email is configured correctly! Check your inbox at hamzasohail429@gmail.com",
  "configured": true
}
```

### Method 2: Using curl

```bash
curl https://your-backend-url.onrender.com/api/v1/admin/test-email
```

### Method 3: Browser

Simply open the URL in your browser:
```
https://speakease-backend.onrender.com/api/v1/admin/test-email
```

---

## 📊 Platform Statistics

### View Real-Time Stats

Visit this endpoint to see platform statistics:

```
https://your-backend-url.onrender.com/api/v1/admin/stats
```

**Response includes:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 10,
      "today": 2,
      "thisWeek": 5,
      "recent": [
        {
          "id": "user-id",
          "name": "John Doe",
          "email": "john@example.com",
          "createdAt": "2025-12-29T10:30:00.000Z"
        }
      ]
    },
    "sessions": {
      "total": 25,
      "today": 5,
      "active": 2
    },
    "messages": {
      "total": 150,
      "today": 30
    },
    "timestamp": "2025-12-29T12:00:00.000Z"
  }
}
```

---

## 👥 View All Users

Get a list of all registered users:

```
https://your-backend-url.onrender.com/api/v1/admin/users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2025-12-29T10:30:00.000Z",
        "updatedAt": "2025-12-29T11:00:00.000Z",
        "_count": {
          "sessions": 3
        }
      }
    ],
    "total": 10
  }
}
```

---

## 📧 Email Notification Examples

### 1. New User Signup Email

```
Subject: 🎉 New User Signed Up on SpeakEase!

User Details:
- Name: John Doe
- Email: john@example.com
- Signed up: Dec 29, 2025, 10:30 AM
- User ID: clxyz123...
```

### 2. User Feedback Email

```
Subject: SpeakEase Feedback: 💡 Suggestion

Type: 💡 Suggestion
From: John Doe (john@example.com)
Date: Dec 29, 2025, 2:45 PM

Message:
It would be great to have more topics about business English!
```

---

## 🔍 Monitoring Dashboard (Manual)

### Quick Check Script

Create a simple script to check your platform:

```bash
#!/bin/bash

BACKEND_URL="https://speakease-backend.onrender.com"

echo "🏥 Health Check:"
curl -s $BACKEND_URL/health | jq

echo ""
echo "📊 Platform Stats:"
curl -s $BACKEND_URL/api/v1/admin/stats | jq

echo ""
echo "✅ Email Test:"
curl -s $BACKEND_URL/api/v1/admin/test-email | jq
```

Save as `check-platform.sh`, make it executable:
```bash
chmod +x check-platform.sh
./check-platform.sh
```

---

## 📱 Mobile Notifications (Optional)

### Using IFTTT

1. Sign up at [ifttt.com](https://ifttt.com)
2. Create applet: "If Gmail receives email from noreply@speakease.com, send notification"
3. Get instant push notifications on your phone!

### Using Zapier

1. Sign up at [zapier.com](https://zapier.com)
2. Create Zap: Gmail → Slack/Discord/SMS
3. Get notified wherever you prefer!

---

## 📈 Analytics & Insights

### What to Track

**Daily:**
- New user signups
- Active sessions
- Messages sent

**Weekly:**
- User growth rate
- Session completion rate
- Popular topics

**Monthly:**
- Total users
- Retention rate
- Feature usage

### Simple Tracking

Visit your stats endpoint daily and note:
```
Date: Dec 29, 2025
- Total Users: 10 (+2 from yesterday)
- Sessions Today: 5
- Messages Today: 30
```

---

## 🚨 Troubleshooting

### Email Not Working?

1. **Check Configuration**:
   ```bash
   curl https://your-backend-url.onrender.com/api/v1/admin/test-email
   ```

2. **Verify Environment Variables**:
   - Go to Render Dashboard → Service → Environment
   - Ensure `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set

3. **Check Logs**:
   - Render Dashboard → Service → Logs
   - Look for email-related errors

4. **Common Issues**:
   - ❌ App Password not generated → Generate one in Gmail settings
   - ❌ 2FA not enabled → Enable it first
   - ❌ Wrong credentials → Double-check email and password

### Not Receiving Notifications?

1. **Check Spam Folder** 📧
2. **Verify Email Address** in `notificationService.ts`
3. **Test Email Manually** using the test endpoint
4. **Check Backend Logs** for errors

---

## 🔐 Security Best Practices

1. **Protect Admin Endpoints** (Future Enhancement):
   ```typescript
   // Add authentication middleware
   router.use(authenticate);
   router.use(requireAdmin);
   ```

2. **Rate Limiting**:
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const adminLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/v1/admin', adminLimiter);
   ```

3. **Environment Variables**:
   - Never commit `.env` files
   - Use different credentials for production
   - Rotate passwords regularly

---

## 📊 Advanced Monitoring (Future)

### Tools to Consider

1. **Sentry** - Error tracking
   - Free tier: 5,000 errors/month
   - https://sentry.io

2. **LogRocket** - Session replay
   - Free tier: 1,000 sessions/month
   - https://logrocket.com

3. **Mixpanel** - Analytics
   - Free tier: 100K events/month
   - https://mixpanel.com

4. **UptimeRobot** - Uptime monitoring
   - Free tier: 50 monitors
   - https://uptimerobot.com

---

## 🎯 Quick Reference

### Important URLs

```bash
# Health Check
https://speakease-backend.onrender.com/health

# Test Email
https://speakease-backend.onrender.com/api/v1/admin/test-email

# Platform Stats
https://speakease-backend.onrender.com/api/v1/admin/stats

# All Users
https://speakease-backend.onrender.com/api/v1/admin/users

# Frontend
https://speakease.vercel.app
```

### Quick Commands

```bash
# Test email
curl https://speakease-backend.onrender.com/api/v1/admin/test-email

# Get stats
curl https://speakease-backend.onrender.com/api/v1/admin/stats | jq

# Get users
curl https://speakease-backend.onrender.com/api/v1/admin/users | jq

# Health check
curl https://speakease-backend.onrender.com/health | jq
```

---

## 📝 Daily Checklist

- [ ] Check email for new user notifications
- [ ] Review platform stats
- [ ] Check for user feedback
- [ ] Monitor error logs in Render
- [ ] Verify backend is running (no cold start issues)

---

## 🆘 Support

If you need help:
1. Check backend logs in Render Dashboard
2. Test email configuration
3. Verify environment variables
4. Review this guide

---

**You're all set! You'll now be notified whenever someone uses your platform!** 🎉

---

*Last updated: December 29, 2025*

