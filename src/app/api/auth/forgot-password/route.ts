import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongoose';
import { generateOTP } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email } = await request.json();
    
    console.log(`🔑 Password reset requested for: ${email}`);
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`⚠️ User not found for password reset: ${email}`);
      return NextResponse.json(
        { success: false, message: 'Email could not be sent' },
        { status: 404 }
      );
    }
    
    // Generate OTP
    const otp = generateOTP();
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    console.log(`✉️ Generated reset code for ${email}: ${otp}`);
    
    // Save OTP to user
    user.resetPasswordToken = otp;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();
    
    // Send reset password email using enhanced function
    const emailSent = await sendPasswordResetEmail(user.email, otp);
    
    if (!emailSent) {
      console.error(`Failed to send reset password email to ${email}`);
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Reset code successfully sent to ${email}`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Password reset code sent to your email' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 