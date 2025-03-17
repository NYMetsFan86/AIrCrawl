import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    
    // Hash the received token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
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
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user
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
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}