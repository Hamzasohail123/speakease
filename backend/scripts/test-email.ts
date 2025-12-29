import dotenv from 'dotenv';
import path from 'path';
import { testEmailConfiguration, sendTestEmail } from '../src/modules/auth/services/notificationService';
import { logger } from '../src/utils/logger';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  console.log('📧 Testing Email Configuration...\n');

  try {
    // Test email configuration
    console.log('1. Checking email configuration...');
    const isConfigured = await testEmailConfiguration();

    if (!isConfigured) {
      console.error('❌ Email is NOT configured properly.');
      console.log('\nPlease check:');
      console.log('- GMAIL_USER is set in .env');
      console.log('- GMAIL_APP_PASSWORD is set in .env');
      console.log('- App password is correct (no spaces)');
      process.exit(1);
    }

    console.log('✅ Email configuration is valid!\n');

    // Send test email
    console.log('2. Sending test email...');
    await sendTestEmail();
    console.log('✅ Test email sent successfully!\n');

    console.log('🎉 SUCCESS! Check your inbox at hamzasohail429@gmail.com');
    console.log('You should receive a test email within a few seconds.\n');

  } catch (error) {
    console.error('❌ Error testing email:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Verify GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env');
    console.log('2. Make sure app password has no spaces');
    console.log('3. Check that 2FA is enabled on your Gmail account');
    console.log('4. Verify the app password is correct');
    process.exit(1);
  }
}

main();

