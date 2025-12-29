import nodemailer from 'nodemailer';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';
import { User } from '@ai-english-speaker/shared';

const ADMIN_EMAIL = 'hamzasohail429@gmail.com';

// Create transporter
function createTransporter() {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587', 10),
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return null;
}

/**
 * Send notification when a new user signs up
 */
export async function notifyNewUserSignup(user: User): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    logger.warn('Email not configured. New user signup logged instead:');
    logger.info(`New user signed up: ${user.name} (${user.email})`);
    return;
  }

  const subject = '🎉 New User Signed Up on SpeakEase!';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .user-info { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-box { background: white; padding: 15px; border-radius: 8px; text-align: center; flex: 1; margin: 0 5px; }
          .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .emoji { font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 New User Signup!</h2>
          </div>
          <div class="content">
            <div class="emoji">👤</div>
            <div class="user-info">
              <h3 style="margin-top: 0; color: #667eea;">User Details</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Signed up:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
              <p><strong>User ID:</strong> ${user.id}</p>
            </div>
            <div class="footer">
              <p>This notification was sent from your SpeakEase platform.</p>
              <p><a href="${env.FRONTEND_URL || 'https://speakease.vercel.app'}" style="color: #667eea;">Visit Dashboard</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
🎉 New User Signed Up on SpeakEase!

User Details:
- Name: ${user.name}
- Email: ${user.email}
- Signed up: ${new Date(user.createdAt).toLocaleString()}
- User ID: ${user.id}

---
This notification was sent from your SpeakEase platform.
  `;

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || env.GMAIL_USER || 'noreply@speakease.com',
      to: ADMIN_EMAIL,
      subject,
      text: textContent,
      html: htmlContent,
    });

    logger.info(`New user signup notification sent for: ${user.email}`);
  } catch (error) {
    logger.error('Failed to send new user notification:', error);
    // Don't throw error - signup should succeed even if notification fails
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    logger.error('Email not configured. Please set up SMTP or Gmail credentials.');
    return false;
  }

  try {
    await transporter.verify();
    logger.info('✅ Email configuration is valid and ready to send emails');
    return true;
  } catch (error) {
    logger.error('❌ Email configuration test failed:', error);
    return false;
  }
}

/**
 * Send test email to admin
 */
export async function sendTestEmail(): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error('Email not configured');
  }

  const subject = '✅ SpeakEase Email Test';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .success-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
          .emoji { font-size: 64px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Email Test Successful!</h2>
          </div>
          <div class="content">
            <div class="emoji">📧</div>
            <div class="success-box">
              <h3 style="margin-top: 0; color: #10b981;">Your email is working!</h3>
              <p>This is a test email from your SpeakEase platform.</p>
              <p>You will receive notifications when:</p>
              <ul>
                <li>✅ New users sign up</li>
                <li>✅ Users submit feedback</li>
                <li>✅ Important system events occur</li>
              </ul>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
✅ Email Test Successful!

This is a test email from your SpeakEase platform.

You will receive notifications when:
- New users sign up
- Users submit feedback
- Important system events occur

Sent at: ${new Date().toLocaleString()}
  `;

  await transporter.sendMail({
    from: env.SMTP_FROM || env.GMAIL_USER || 'noreply@speakease.com',
    to: ADMIN_EMAIL,
    subject,
    text: textContent,
    html: htmlContent,
  });

  logger.info('Test email sent successfully');
}

