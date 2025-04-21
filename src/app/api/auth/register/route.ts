import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongoose';
import { generateJWT } from '@/lib/tokens';

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
      console.log(`⚠️ Email already registered: ${email}`);
      return NextResponse.json(
        { success: false, message: 'Email is already registered' },
        { status: 400 }
      );
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    // Generate JWT token
    const token = generateJWT(user._id);
    
    console.log(`✅ Registration successful for ${email}`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration successful!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
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