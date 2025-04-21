import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongoose';
import { generateOTP } from '@/lib/tokens';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, type } = await request.json();
    
    console.log(`🔄 Resending OTP for ${email}, type: ${type}`);
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`⚠️ User not found: ${email}`);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    console.log(`✉️ Generated new OTP for ${email}: ${otp}`);
    
    if (type === 'verification') {
      user.verificationToken = otp;
      user.verificationExpire = otpExpire;
      
      await user.save();
      
      // Send verification email using enhanced function
      const emailSent = await sendVerificationEmail(user.email, otp, user.name);
      
      if (!emailSent) {
        console.error(`Failed to send verification email to ${email}`);
        return NextResponse.json(
          { success: false, message: 'Failed to send verification email' },
          { status: 500 }
        );
      }
    } else if (type === 'reset') {
      user.resetPasswordToken = otp;
      user.resetPasswordExpire = otpExpire;
      
      await user.save();
      
      // Send reset password email using enhanced function
      const emailSent = await sendPasswordResetEmail(user.email, otp);
      
      if (!emailSent) {
        console.error(`Failed to send reset password email to ${email}`);
        return NextResponse.json(
          { success: false, message: 'Failed to send reset password email' },
          { status: 500 }
        );
      }
    } else {
      console.log(`⚠️ Invalid OTP type: ${type}`);
      return NextResponse.json(
        { success: false, message: 'Invalid OTP type' },
        { status: 400 }
      );
    }
    
    console.log(`✅ OTP successfully sent to ${email}`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Verification code sent to your email' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 