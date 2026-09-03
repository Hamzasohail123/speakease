import nodemailer from 'nodemailer';
import { env } from '../config/env';

/**
 * Create nodemailer transporter based on environment configuration
 * Supports both SMTP and Gmail configurations
 * @returns Transporter instance or null if no email config exists
 */
export function createTransporter() {
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

  // Fallback: Use Gmail with App Password
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

