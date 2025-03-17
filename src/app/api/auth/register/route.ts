import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/server/db'; // Adjust to your actual database import

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user in database (adjust based on your DB schema)
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' }, 
      { status: 500 }
    );
  }
}