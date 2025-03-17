import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/server/services/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body || typeof body.email !== 'string' || !body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const { email } = body;
    
    // Find user
    const user = await db.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Return success even if no user for security purposes
      // This prevents email enumeration attacks
      return NextResponse.json({ success: true });
    }
    
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token expiration (1 hour from now)
    const tokenExpiration = new Date(Date.now() + 3600000);
    
    // Save to database
    await db.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: hashedToken,
        reset_password_expires: tokenExpiration
      }
    });
    
    // Send email with unhashed token
    const resetUrl = `${process.env.NEXTAUTH_URL}/api/auth/reset-password/${resetToken}/page`;
    
    await sendPasswordResetEmail(
      user.email as string, 
      user.name || 'User',
      resetUrl
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Route to handle password reset with token
export async function PUT(req: Request) {
  try {
    const { token, password } = await req.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Hash the received token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
      
    // Finding user with valid token
    const user = await db.user.findFirst({
      where: {
        reset_password_token: hashedToken,
        reset_password_expires: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Resetting password
    await db.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null
      }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}