# 📧 Email Setup for Feedback

This guide explains how to configure email sending for the feedback form.

## 🎯 Quick Setup Options

### Option 1: Gmail App Password (Easiest - Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

3. **Add to Backend `.env`**:
   ```env
   GMAIL_USER=hamzasohail429@gmail.com
   GMAIL_APP_PASSWORD=your_16_char_app_password
   ```

### Option 2: SMTP (Any Email Provider)

For Gmail, Outlook, or any SMTP provider:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hamzasohail429@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false
SMTP_FROM=hamzasohail429@gmail.com
```

**Common SMTP Settings:**
- **Gmail**: `smtp.gmail.com:587`
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`

### Option 3: Email Service (Production)

For production, consider using:
- **Resend** (recommended - modern, easy)
- **SendGrid**
- **Mailgun**
- **AWS SES**

## 🔧 Configuration

Add these to your backend `.env` file:

```env
# Option 1: Gmail (Simplest)
GMAIL_USER=hamzasohail429@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here

# Option 2: SMTP (More flexible)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hamzasohail429@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false
SMTP_FROM=hamzasohail429@gmail.com
```

## ✅ Testing

1. Start your backend server
2. Submit feedback through the dashboard
3. Check your email inbox (hamzasohail429@gmail.com)

## 🚨 Fallback Behavior

If email is not configured:
- Feedback will be **logged** to console instead
- No errors will occur
- You can still see feedback in server logs

## 📝 Production Deployment

When deploying to Railway/Render:

1. Add the email environment variables in the platform dashboard
2. Use **Gmail App Password** for simplicity
3. Or set up a dedicated email service (Resend recommended)

## 🔒 Security Notes

- **Never commit** `.env` files
- Use **App Passwords**, not your main password
- For production, consider using a dedicated email service

---

**Need help?** Check the server logs if emails aren't sending.

