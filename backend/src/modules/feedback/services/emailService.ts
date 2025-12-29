import nodemailer from 'nodemailer';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';

interface FeedbackEmailData {
  type: string;
  message: string;
  userEmail: string;
  userName: string;
}

const RECIPIENT_EMAIL = 'hamzasohail429@gmail.com';

// Create transporter based on environment
function createTransporter() {
  // If SMTP credentials are provided, use them
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587', 10),
      secure: env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  // Fallback: Use Gmail with OAuth2 or App Password
  // For development, you can use a test account
  // For production, set up proper SMTP credentials
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // If no email config, return null (will log instead)
  return null;
}

const typeLabels: Record<string, string> = {
  feedback: '💬 General Feedback',
  suggestion: '💡 Suggestion',
  bug: '🐛 Bug Report',
  feature: '✨ Feature Request',
  other: '📝 Other',
};

export async function sendFeedbackEmail(data: FeedbackEmailData): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    // If no email config, just log the feedback
    logger.warn('Email not configured. Feedback logged instead:');
    logger.info(JSON.stringify(data, null, 2));
    return;
  }

  const subject = `SpeakEase Feedback: ${typeLabels[data.type] || data.type}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .message-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Feedback from SpeakEase</h2>
          </div>
          <div class="content">
            <div class="info-box">
              <strong>Type:</strong> ${typeLabels[data.type] || data.type}<br>
              <strong>From:</strong> ${data.userName} (${data.userEmail})<br>
              <strong>Date:</strong> ${new Date().toLocaleString()}
            </div>
            <div class="message-box">
              <strong>Message:</strong><br>
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
            <div class="footer">
              This feedback was submitted through the SpeakEase platform.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
New Feedback from SpeakEase

Type: ${typeLabels[data.type] || data.type}
From: ${data.userName} (${data.userEmail})
Date: ${new Date().toLocaleString()}

Message:
${data.message}

---
This feedback was submitted through the SpeakEase platform.
  `;

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || env.GMAIL_USER || 'noreply@speakease.com',
      to: RECIPIENT_EMAIL,
      subject,
      text: textContent,
      html: htmlContent,
      replyTo: data.userEmail,
    });

    logger.info(`Feedback email sent successfully from ${data.userEmail}`);
  } catch (error) {
    logger.error('Failed to send feedback email:', error);
    throw new Error('Failed to send feedback email');
  }
}

