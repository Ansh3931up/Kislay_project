import sendEmail from '../sendEmail';
import crypto from 'crypto';

/**
 * Generates a random 6-digit OTP
 */
export const generateOTP = (): string => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends a verification email with OTP
 */
export const sendVerificationEmail = async (email: string, otp: string, name: string = ''): Promise<boolean> => {
  const greeting = name ? `Hello ${name},` : 'Hello,';
  
  try {
    await sendEmail({
      to: email,
      subject: 'Email Verification Code',
      text: `${greeting}

Your email verification code is: ${otp}

Please enter this code in the verification page to complete your registration.
This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

Thank you,
Authentication System Team`
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

/**
 * Sends a password reset email with OTP
 */
export const sendPasswordResetEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Code',
      text: `Hello,

Your password reset code is: ${otp}

Please enter this code in the reset password page to set a new password.
This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

Thank you,
Authentication System Team`
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
};

/**
 * Validates that an OTP is a 6-digit number
 */
export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export default {
  generateOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
  validateOTP
}; 