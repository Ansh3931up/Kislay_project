import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongoose';
import { generateOTP } from '@/lib/tokens';
import {sendEmail} from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, email, password } = await request.json();
    
    console.log(`👤 New registration request for: ${email}`);
    
    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email and password are required' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      if (!userExists.isVerified) {
        // If user exists but is not verified, send a new OTP
        const otp = generateOTP();
        const verificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        
        console.log(`✉️ User exists but not verified. Generating new code for ${email}: ${otp}`);
        
        userExists.verificationToken = otp;
        userExists.verificationExpire = verificationExpire;
        await userExists.save();
        
        // Send verification email using enhanced function
          const emailSent = await sendEmail({
            to: email,
            subject: 'Verification Code',
            html: `Your verification code is ${otp}`
          });
          
        if (!emailSent) {
          console.error(`Failed to send verification email to ${email}`);
          return NextResponse.json(
            { success: false, message: 'Failed to send verification email' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { 
            success: true, 
            message: 'Account found but not verified. A new verification code has been sent to your email.' 
          },
          { status: 200 }
        );
      } else {
        console.log(`⚠️ Email already registered and verified: ${email}`);
        return NextResponse.json(
          { success: false, message: 'Email is already registered' },
          { status: 400 }
        );
      }
    }
    
    // Generate OTP for email verification
    const otp = generateOTP();
    const verificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    console.log(`✉️ Generating verification code for new user ${email}: ${otp}`);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken: otp,
      verificationExpire,
    });
    
    const emailSent = await sendEmail({
      to: email,
      subject: 'Verification Code',
      html: `Your verification code is ${otp}`
    });
    
    if (!emailSent) {
      console.error(`Failed to send verification email to ${email}`);
      return NextResponse.json(
        { success: false, message: 'Registration successful but failed to send verification email. Please request a new code.' },
        { status: 201 }
      );
    }
    
    console.log(`✅ Registration successful for ${email}, verification code sent`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration successful! Please check your email for the verification code.' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 