import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a reset token
export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire time - 10 minutes
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return {
    resetToken,
    resetPasswordToken,
    resetPasswordExpire,
  };
};

// Generate JWT token
export const generateJWT = (id: string) => {
  const secret = process.env.JWT_SECRET || 'mysecretkey123';
  return jwt.sign(
    { id },
    secret as string,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify JWT token
export const verifyJWT = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET || 'mysecretkey123';
    const decoded = jwt.verify(token, secret as string);
    return decoded;
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return null;
  }
}; 