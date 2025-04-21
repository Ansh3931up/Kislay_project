import nodemailer from 'nodemailer';
import emailConfig from '../config/email';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Define interface for the sendMail options
interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Create a development transporter that just logs emails
const createDevTransport = () => {
  return {
    sendMail: (options: SendMailOptions) => {
      console.log('\n\n========== EMAIL SENT (DEVELOPMENT MODE) ==========');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:');
      console.log('----------------------------------------');
      console.log(options.text);
      console.log('----------------------------------------');
      
      // Log verification code or password reset code if present
      const codeMatch = options.text.match(/verification code is: (\d+)/i) || 
                        options.text.match(/reset code is: (\d+)/i) ||
                        options.text.match(/code: (\d+)/i) ||
                        options.text.match(/(\d{6})/);
      
      if (codeMatch && codeMatch[1]) {
        console.log('\n🔑 VERIFICATION CODE: ' + codeMatch[1] + ' 🔑\n');
      }
      
      console.log('====================================================\n\n');
      return Promise.resolve({ messageId: 'dev-message-id' });
    }
  };
};

// For testing, create a local testing account
const createTestTransport = async () => {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    console.log('Created test account:', testAccount.user);

    // Create a testing transporter
    const transport = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Test SMTP transporter created successfully');
    return transport;
  } catch (error) {
    console.error('Failed to create test transporter:', error);
    return null;
  }
};

const sendEmail = async (options: EmailOptions) => {
  // IMPORTANT: In development, just log emails and don't try to send
  // This solves the authentication error with Brevo
  
  try {
    // Always log the email to console for debugging
    const devTransporter = createDevTransport();
    await devTransporter.sendMail({
      from: `"${emailConfig.senderName}" <${emailConfig.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, '<br>'),
    });

    // Since we're still in development, don't attempt real SMTP
    // When you want to test actual email delivery, you can use Ethereal
    if (process.env.USE_TEST_EMAIL === 'true') {
      const testTransporter = await createTestTransport();
      if (testTransporter) {
        const mailOptions = {
          from: `"${emailConfig.senderName}" <${emailConfig.from}>`,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html || options.text.replace(/\n/g, '<br>'),
        };

        const info = await testTransporter.sendMail(mailOptions);
        console.log('Test email sent successfully');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    }

    return { success: true, messageId: 'dev-message-id' };
  } catch (error) {
    console.error('Email error:', error);
    // Don't throw error to prevent app from crashing
    return { success: false, error };
  }
};

export default sendEmail; 