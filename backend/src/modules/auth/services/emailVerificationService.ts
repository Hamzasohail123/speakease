import crypto from 'crypto';
import { createTransporter } from '../../../utils/emailService';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';
import { updateUser } from '../repositories/userRepository';
import { User } from '@ai-english-speaker/shared';

/**
 * Generate a cryptographically secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set verification token expiry (24 hours from now)
 */
export function getVerificationTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    logger.warn('Email not configured. Verification email not sent.');
    throw new Error('Email service not configured');
  }

  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
          .message {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .link-fallback {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #666;
            word-break: break-all;
          }
          .expiry {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #999;
            text-align: center;
          }
          .footer { 
            text-align: center; 
            padding: 30px;
            background: #f8f9fa;
            color: #666; 
            font-size: 12px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Welcome to SpeakEase!</h1>
          </div>
          <div class="content">
            <div class="greeting">
              Hi ${name},
            </div>
            <div class="message">
              Thank you for signing up! We're excited to have you join our community of English learners.
              <br><br>
              To get started, please verify your email address by clicking the button below:
            </div>
            <div class="button-container">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <div class="link-fallback">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
            </div>
            <div class="expiry">
              This verification link will expire in 24 hours.
            </div>
          </div>
          <div class="footer">
            <p>If you didn't create an account with SpeakEase, please ignore this email.</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} SpeakEase. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Welcome to SpeakEase!

Hi ${name},

Thank you for signing up! We're excited to have you join our community of English learners.

To get started, please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours.

If you didn't create an account with SpeakEase, please ignore this email.

© ${new Date().getFullYear()} SpeakEase. All rights reserved.
  `;

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || env.GMAIL_USER || 'noreply@speakease.com',
      to: email,
      subject: 'Verify your SpeakEase account',
      text: textContent,
      html: htmlContent,
    });

    logger.info(`Verification email sent successfully to ${email}`);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Verify email token and update user
 */
export async function verifyEmailToken(token: string): Promise<{ success: boolean; user?: User }> {
  const { findUserByVerificationToken } = await import('../repositories/userRepository.js');
  const user = await findUserByVerificationToken(token);

  if (!user) {
    return { success: false };
  }

  // Check if token matches
  if (user.emailVerificationToken !== token) {
    return { success: false };
  }

  // Check if token is expired
  if (user.emailVerificationTokenExpiry && new Date() > user.emailVerificationTokenExpiry) {
    return { success: false };
  }

  // Check if already verified
  if (user.emailVerified) {
    return { success: true, user };
  }

  // Verify email and clear token
  const verifiedUser = await updateUser(user.id, {
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationTokenExpiry: null,
  });

  return { success: true, user: verifiedUser };
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(userId: string): Promise<void> {
  const { findUserById } = await import('../repositories/userRepository.js');
  const user = await findUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.emailVerified) {
    throw new Error('Email already verified');
  }

  // Generate new token
  const token = generateVerificationToken();
  const expiry = getVerificationTokenExpiry();

  // Update user with new token
  await updateUser(userId, {
    emailVerificationToken: token,
    emailVerificationTokenExpiry: expiry,
  });

  // Send verification email
  await sendVerificationEmail(user.email, user.name, token);
}
